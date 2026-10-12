import * as SecureStore from "expo-secure-store";
import type { Session, TokenPairResponse } from "@/types/auth";
import { decodeAccessToken } from "./jwt";

/**
 * Unlike the web portal (which namespaces a session per portal area to
 * keep a staff tab and a patient tab from clobbering each other's
 * `localStorage` key), this app only ever holds one patient session, so
 * one SecureStore key is enough. Persisted to the device Keychain/Keystore
 * rather than `AsyncStorage` since access/refresh tokens are sensitive.
 */
const SESSION_KEY = "nehr.patient.session";

export function buildSession(tokens: TokenPairResponse): Session {
  const claims = decodeAccessToken(tokens.accessToken);
  return {
    ...tokens,
    actorType: claims.actor_type,
    subject: claims.sub,
    hospitalDid: claims.hospital_did,
  };
}

export async function getSession(): Promise<Session | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
