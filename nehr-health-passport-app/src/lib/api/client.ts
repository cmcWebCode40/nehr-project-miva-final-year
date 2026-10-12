import { clearSession, getSession, setSession } from "@/lib/auth/session";
import type { TokenPairResponse } from "@/types/auth";
import axios, { AxiosError, create, isAxiosError, type InternalAxiosRequestConfig } from "axios";
import "react-native-url-polyfill/auto";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details?: string[];
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const client = create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<TokenPairResponse | null> {
  try {
    const { data } = await axios.post<TokenPairResponse>(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });
    return data;
  } catch {
    return null;
  }
}

/**
 * On an unrecoverable 401 there's no `window.location` to redirect through
 * like the web portal - callers (the auth guard, the session hook) are
 * responsible for noticing the cleared session and routing back to login.
 */
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as RetryableConfig | undefined;
    const session = await getSession();

    if (error.response?.status === 401 && config && !config._retry && session?.refreshToken) {
      config._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(session.refreshToken).then(async (tokens) => {
          refreshPromise = null;
          if (!tokens) return null;
          await setSession({ ...session, ...tokens });
          return tokens.accessToken;
        });
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        config.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return client(config);
      }

      await clearSession();
    }

    return Promise.reject(error);
  }
);

export function apiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.details?.length) return body.details.join(", ");
    if (body?.message) return body.message;
  }
  return fallback;
}

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    client.get<T>(url, { params }).then((res) => res.data),
  post: <T>(url: string, body?: unknown) => client.post<T>(url, body).then((res) => res.data),
  patch: <T>(url: string, body?: unknown) => client.patch<T>(url, body).then((res) => res.data),
  delete: <T>(url: string) => client.delete<T>(url).then((res) => res.data),
};
