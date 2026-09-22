import { x25519 } from "@noble/curves/ed25519.js";
import { blake3 } from "@noble/hashes/blake3.js";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { base64ToBytes, multibaseToBytes } from "./encoding";

/**
 * Mirrors the server's own encryption path in `CredentialIssuanceService`
 * exactly (X25519 agreement -> BLAKE3-256 of the shared secret as the
 * symmetric key -> XChaCha20-Poly1305), just run with the *patient's*
 * private key and the *issuer's* public key instead of the other way
 * around - ECDH agreement gives the same shared secret either direction.
 */
export function decryptRecord(
  recipientPrivateKeyBase64: string,
  senderPublicKeyMultibase: string,
  nonceBase64: string,
  ciphertextBase64: string
): Uint8Array {
  const privateKey = base64ToBytes(recipientPrivateKeyBase64);
  const senderPublicKey = multibaseToBytes(senderPublicKeyMultibase);
  const sharedSecret = x25519.getSharedSecret(privateKey, senderPublicKey);
  const symmetricKey = blake3(sharedSecret);
  return xchacha20poly1305(symmetricKey, base64ToBytes(nonceBase64)).decrypt(base64ToBytes(ciphertextBase64));
}

/** Finds a DID Document's X25519 key-agreement verification method and returns its multibase-encoded public key. */
export function extractX25519PublicKeyMultibase(didDocument: Record<string, unknown>): string {
  const methods = didDocument.verificationMethod;
  if (!Array.isArray(methods)) {
    throw new Error("DID Document has no verificationMethod array");
  }
  const method = methods.find(
    (m): m is { type: string; publicKeyMultibase: string } =>
      typeof m === "object" && m !== null && (m as { type?: string }).type === "X25519KeyAgreementKey2020"
  );
  if (!method) {
    throw new Error("DID Document has no X25519KeyAgreementKey2020 verification method");
  }
  return method.publicKeyMultibase;
}
