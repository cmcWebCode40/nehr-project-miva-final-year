/**
 * Byte <-> base64 helpers, kept separate from key generation so both can
 * be unit-tested independently of any UI. Deliberately not relying on the
 * newer `Uint8Array.prototype.toBase64` (inconsistent runtime support) -
 * this works identically in every browser.
 */

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * The backend encodes DID challenge nonces as unpadded base64url
 * (`Base64.getUrlEncoder().withoutPadding()`) - `atob` only understands
 * standard base64, so this reintroduces padding and swaps the two
 * alphabet characters before decoding.
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
