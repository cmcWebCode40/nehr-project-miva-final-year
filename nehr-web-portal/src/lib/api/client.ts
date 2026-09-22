import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearSession, getSession, loginPathFor, setSession } from "@/lib/auth/session";
import type { TokenPairResponse } from "@/types/auth";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details?: string[];
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const session = getSession();
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

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as RetryableConfig | undefined;
    const session = getSession();

    if (error.response?.status === 401 && config && !config._retry && session?.refreshToken) {
      config._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(session.refreshToken).then((tokens) => {
          refreshPromise = null;
          if (!tokens) return null;
          setSession({ ...session, ...tokens });
          return tokens.accessToken;
        });
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        config.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return client(config);
      }

      const actorType = session.actorType;
      clearSession();
      if (typeof window !== "undefined") {
        window.location.href = loginPathFor(actorType);
      }
    }

    return Promise.reject(error);
  }
);

export function apiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
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
