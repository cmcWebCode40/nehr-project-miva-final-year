import { argon2id } from "@noble/hashes/argon2.js";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { randomBytes } from "@noble/ciphers/utils.js";
import { base64ToBytes, bytesToBase64 } from "./encoding";

/**
 * Client-side envelope for a managed-custody patient's own private keys -
 * ported from the web portal's `patientVault.ts`, with one deliberate
 * substitution: the web version derives the key with `hash-wasm`'s
 * Argon2id (WebAssembly), which Hermes doesn't reliably support (no
 * WebAssembly runtime in the Hermes versions this app ships against).
 * `@noble/hashes` ships a pure-JS Argon2id - same parameters, same output,
 * no WASM - so it's a safer choice here without changing the algorithm.
 * Because both encryption and decryption happen in this same module, the
 * KDF/AEAD parameters only need to be internally consistent with
 * themselves, not matched to the backend's own Argon2id use.
 */
const ARGON2ID_PARAMS = { t: 2, m: 19456, p: 1, dkLen: 32 } as const;
const SALT_LENGTH = 16;
const NONCE_LENGTH = 24;

function deriveKey(password: string, salt: Uint8Array): Uint8Array {
  return argon2id(password, salt, ARGON2ID_PARAMS);
}

/** Packs salt || nonce || ciphertext(+tag) into one opaque base64 blob - the wire format the backend's DTOs expect. */
export async function encryptPrivateKey(password: string, privateKeyBase64: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const nonce = randomBytes(NONCE_LENGTH);
  const key = deriveKey(password, salt);
  const ciphertext = xchacha20poly1305(key, nonce).encrypt(base64ToBytes(privateKeyBase64));

  const packed = new Uint8Array(salt.length + nonce.length + ciphertext.length);
  packed.set(salt, 0);
  packed.set(nonce, salt.length);
  packed.set(ciphertext, salt.length + nonce.length);
  return bytesToBase64(packed);
}

export async function decryptPrivateKey(password: string, blobBase64: string): Promise<string> {
  const packed = base64ToBytes(blobBase64);
  const salt = packed.slice(0, SALT_LENGTH);
  const nonce = packed.slice(SALT_LENGTH, SALT_LENGTH + NONCE_LENGTH);
  const ciphertext = packed.slice(SALT_LENGTH + NONCE_LENGTH);

  const key = deriveKey(password, salt);
  const plaintext = xchacha20poly1305(key, nonce).decrypt(ciphertext);
  return bytesToBase64(plaintext);
}
