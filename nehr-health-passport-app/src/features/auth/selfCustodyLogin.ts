import { api } from "@/lib/api/client";
import { base64UrlToBytes, bytesToBase64 } from "@/lib/crypto/encoding";
import { signEd25519 } from "@/lib/crypto/keys";
import type { TokenPairResponse } from "@/types/auth";

interface ChallengeResponse {
  nonce: string;
  expiresAt: string;
}

/** Shared by registration's auto-login and the login screen's "Continue as this device" button - both are the same DID challenge-response round trip. */
export async function performSelfCustodyLogin(did: string, ed25519PrivateKeyBase64: string): Promise<TokenPairResponse> {
  const challenge = await api.post<ChallengeResponse>("/auth/challenge", { did });
  const signature = signEd25519(ed25519PrivateKeyBase64, base64UrlToBytes(challenge.nonce));
  return api.post<TokenPairResponse>("/auth/verify", {
    did,
    nonce: challenge.nonce,
    signature: bytesToBase64(signature),
  });
}
