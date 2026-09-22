import { ed25519, x25519 } from "@noble/curves/ed25519.js";
import { base64ToBytes, bytesToBase64 } from "./encoding";

export interface KeyPair {
  publicKeyBase64: string;
  privateKeyBase64: string;
}

/**
 * Client-side key generation, decoupled from any UI, matching how the
 * backend expects keys to be produced: the server never generates a
 * hospital's or patient's keypair itself (ch.3.3.3) - only a doctor's
 * personal keypair is server-generated, which is why no doctor-facing
 * form in this portal calls into this module.
 *
 * A managed-custody patient's Argon2id + XChaCha20-Poly1305 key-wrapping
 * lives in `patientVault.ts`, not here - this module only ever generates
 * raw keypairs, never encrypts them.
 */
export function generateEd25519KeyPair(): KeyPair {
  const { secretKey, publicKey } = ed25519.keygen();
  return {
    publicKeyBase64: bytesToBase64(publicKey),
    privateKeyBase64: bytesToBase64(secretKey),
  };
}

export function generateX25519KeyPair(): KeyPair {
  const { secretKey, publicKey } = x25519.keygen();
  return {
    publicKeyBase64: bytesToBase64(publicKey),
    privateKeyBase64: bytesToBase64(secretKey),
  };
}

export interface HospitalKeyMaterial {
  ed25519PublicKey: string;
  ed25519PrivateKey: string;
  x25519PublicKey: string;
  x25519PrivateKey: string;
}

export function generateHospitalKeyMaterial(): HospitalKeyMaterial {
  const signing = generateEd25519KeyPair();
  const encryption = generateX25519KeyPair();
  return {
    ed25519PublicKey: signing.publicKeyBase64,
    ed25519PrivateKey: signing.privateKeyBase64,
    x25519PublicKey: encryption.publicKeyBase64,
    x25519PrivateKey: encryption.privateKeyBase64,
  };
}

/** Same shape as {@link HospitalKeyMaterial} - patients get the same two keypairs, generated the same way. */
export type PatientKeyMaterial = HospitalKeyMaterial;

export function generatePatientKeyMaterial(): PatientKeyMaterial {
  return generateHospitalKeyMaterial();
}

export function signEd25519(privateKeyBase64: string, message: Uint8Array): Uint8Array {
  return ed25519.sign(message, base64ToBytes(privateKeyBase64));
}
