/**
 * A self-custody patient's private keys are meant to never leave the
 * device they were generated on (ch.3.3.3) - a real mobile app would
 * hold them in secure hardware-backed storage. A browser has no
 * equivalent, so this portal persists them in `localStorage` purely to
 * make repeat testing in the same browser possible; this is a deliberate
 * demo-only deviation (see docs/HANDOFF.md), not how the mobile app
 * should do it. Single-slot by design - one self-custody identity per
 * browser is enough for testing the flow end to end.
 */
const STORAGE_KEY = "nehr.patient.selfCustodyIdentity";

export interface SelfCustodyIdentity {
  did: string;
  ed25519PrivateKey: string;
  x25519PrivateKey: string;
}

export function saveSelfCustodyIdentity(identity: SelfCustodyIdentity): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

export function getSelfCustodyIdentity(): SelfCustodyIdentity | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SelfCustodyIdentity;
  } catch {
    return null;
  }
}

export function clearSelfCustodyIdentity(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
