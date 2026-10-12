import { Base64 } from "js-base64";
import type { ActorType } from "@/types/auth";

interface AccessTokenClaims {
  sub: string;
  actor_type: ActorType;
  hospital_did?: string;
  role?: string;
  department?: string;
  token_version?: number;
  exp: number;
}

/**
 * Decodes (does not verify - the server is the only party that needs to
 * verify) the access token's payload, purely so the UI knows who's signed
 * in. The backend's login endpoints return only the token pair, not a
 * separate profile object, so this is the one place that information
 * exists client-side.
 */
export function decodeAccessToken(accessToken: string): AccessTokenClaims {
  const [, payload] = accessToken.split(".");
  if (!payload) {
    throw new Error("Malformed access token");
  }
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const json = Base64.decode(padded);
  return JSON.parse(json) as AccessTokenClaims;
}
