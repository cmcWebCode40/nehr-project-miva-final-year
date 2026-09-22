import { argon2id } from "hash-wasm";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { randomBytes } from "@noble/ciphers/utils.js";
import { base64ToBytes, bytesToBase64 } from "./encoding";

/**
 * Client-side envelope for a managed-custody patient's own private keys
 * (ch.3.3.3/3.6.3): the server only ever stores and returns this
 * ciphertext, so encryption and decryption both happen here, in the
 * browser, using the patient's password - never on the server. Because
 * both sides of this envelope are this same module, the KDF/AEAD
 * parameters below only need to be internally consistent, not matched to
 * the backend's own (server-side, hospital-key-wrapping) Argon2id use.
 */
const ARGON2ID_PARAMS = { iterations: 2, parallelism: 1, memorySize: 19456, hashLength: 32 } as const;
const SALT_LENGTH = 16;
const NONCE_LENGTH = 24;

async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  return argon2id({
    password,
    salt,
    ...ARGON2ID_PARAMS,
    outputType: "binary",
  });
}

/** Packs salt || nonce || ciphertext(+tag) into one opaque base64 blob - the wire format the backend's DTOs expect. */
export async function encryptPrivateKey(password: string, privateKeyBase64: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const nonce = randomBytes(NONCE_LENGTH);
  const key = await deriveKey(password, salt);
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

  const key = await deriveKey(password, salt);
  const plaintext = xchacha20poly1305(key, nonce).decrypt(ciphertext);
  return bytesToBase64(plaintext);
}
