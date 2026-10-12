import * as SecureStore from "expo-secure-store";

/**
 * A self-custody patient's private keys never leave the device they were
 * generated on. The web portal this is ported from stores the equivalent
 * in `localStorage` as a documented demo-only stand-in, since a browser
 * has no secure enclave - a phone does. This is the one place mobile must
 * deliberately differ from the web app: iOS Keychain / Android Keystore
 * via `expo-secure-store`, not plain storage. Single-slot by design, same
 * as the web app - one self-custody identity per device.
 */
const STORAGE_KEY = "nehr.patient.selfCustodyIdentity";

export interface SelfCustodyIdentity {
  did: string;
  ed25519PrivateKey: string;
  x25519PrivateKey: string;
}

export async function saveSelfCustodyIdentity(identity: SelfCustodyIdentity): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(identity));
}

export async function getSelfCustodyIdentity(): Promise<SelfCustodyIdentity | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelfCustodyIdentity;
  } catch {
    return null;
  }
}

export async function clearSelfCustodyIdentity(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
