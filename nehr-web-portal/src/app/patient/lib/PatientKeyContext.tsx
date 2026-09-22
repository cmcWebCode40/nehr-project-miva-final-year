"use client";

import { createContext, useContext, useState } from "react";

/**
 * Holds the patient's decrypted Ed25519 (signing) + X25519 (record
 * decryption) private keys in memory only, for the current tab - never
 * written to any storage. Managed-custody patients re-derive these from
 * their password every time they log in (same pattern staff already use
 * for `doctorPassword` on each credential issuance, rather than caching
 * anything long-lived); self-custody patients reload theirs from
 * `selfCustodyIdentity.ts` on mount instead of re-deriving them, since
 * there's no password to derive from.
 *
 * Lives at `/patient/layout.tsx` (above both the public register/login
 * pages and the protected area) so the same provider instance survives
 * the client-side navigation from registration or login into the
 * dashboard.
 */
export interface PatientKeyMaterial {
  ed25519PrivateKey: string;
  x25519PrivateKey: string;
}

interface PatientKeyContextValue {
  keys: PatientKeyMaterial | null;
  setKeys: (keys: PatientKeyMaterial | null) => void;
}

const PatientKeyContext = createContext<PatientKeyContextValue | null>(null);

export function PatientKeyProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<PatientKeyMaterial | null>(null);
  return <PatientKeyContext.Provider value={{ keys, setKeys }}>{children}</PatientKeyContext.Provider>;
}

export function usePatientKeys(): PatientKeyContextValue {
  const ctx = useContext(PatientKeyContext);
  if (!ctx) throw new Error("usePatientKeys must be used within PatientKeyProvider");
  return ctx;
}
