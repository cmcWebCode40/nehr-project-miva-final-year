import { ed25519, x25519 } from "@noble/curves/ed25519.js";
import { base64ToBytes, bytesToBase64 } from "./encoding";

export interface KeyPair {
  publicKeyBase64: string;
  privateKeyBase64: string;
}

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

export interface PatientKeyMaterial {
  ed25519PublicKey: string;
  ed25519PrivateKey: string;
  x25519PublicKey: string;
  x25519PrivateKey: string;
}

export function generatePatientKeyMaterial(): PatientKeyMaterial {
  const signing = generateEd25519KeyPair();
  const encryption = generateX25519KeyPair();
  return {
    ed25519PublicKey: signing.publicKeyBase64,
    ed25519PrivateKey: signing.privateKeyBase64,
    x25519PublicKey: encryption.publicKeyBase64,
    x25519PrivateKey: encryption.privateKeyBase64,
  };
}

export function signEd25519(privateKeyBase64: string, message: Uint8Array): Uint8Array {
  return ed25519.sign(message, base64ToBytes(privateKeyBase64));
}
