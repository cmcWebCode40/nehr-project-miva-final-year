import { Base64 } from "js-base64";

/**
 * Byte <-> base64 helpers. React Native/Hermes has no `atob`/`btoa`, unlike
 * the web portal this is ported from - `js-base64` is the drop-in
 * replacement, chosen over Node's `Buffer` polyfill since it needs no
 * global shim.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  return Base64.fromUint8Array(bytes);
}

export function base64ToBytes(base64: string): Uint8Array {
  return Base64.toUint8Array(base64);
}

/**
 * The backend encodes DID challenge nonces as unpadded base64url
 * (`Base64.getUrlEncoder().withoutPadding()`) - reintroduce padding and
 * swap the two alphabet characters before decoding as standard base64.
 */
export function base64UrlToBytes(base64Url: string): Uint8Array {
  const normalized = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return base64ToBytes(padded);
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * base58btc decode, matching the backend's `Codecs.base58Decode` - needed
 * to read the raw public key bytes back out of a DID Document's
 * multibase-encoded (`z`-prefixed) `publicKeyMultibase` values.
 */
export function multibaseToBytes(multibase: string): Uint8Array {
  if (!multibase.startsWith("z")) {
    throw new Error("Only base58btc ('z'-prefixed) multibase is supported");
  }
  const encoded = multibase.slice(1);
  let leadingOnes = 0;
  while (leadingOnes < encoded.length && encoded[leadingOnes] === BASE58_ALPHABET[0]) {
    leadingOnes++;
  }
  let value = BigInt(0);
  for (let i = leadingOnes; i < encoded.length; i++) {
    const digit = BASE58_ALPHABET.indexOf(encoded[i]);
    if (digit < 0) throw new Error(`Invalid base58 character: ${encoded[i]}`);
    value = value * BigInt(58) + BigInt(digit);
  }
  const valueBytes: number[] = [];
  while (value > BigInt(0)) {
    valueBytes.unshift(Number(value & BigInt(0xff)));
    value >>= BigInt(8);
  }
  return new Uint8Array([...Array(leadingOnes).fill(0), ...valueBytes]);
}
