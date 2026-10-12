import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Holds the patient's decrypted Ed25519 (signing) + X25519 (record
 * decryption) private keys in memory only - never written to any storage.
 * Managed-custody patients re-derive these from their password on every
 * login; self-custody patients reload theirs from `selfCustodyIdentity.ts`
 * (secure device storage) on app start instead, since there's no password
 * to derive from. A managed-custody account genuinely needs to sign in
 * again after the app is killed, exactly like the web app - caching
 * plaintext key material anywhere durable would undermine the entire
 * point of managed custody.
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

export function PatientKeyProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<PatientKeyMaterial | null>(null);
  return <PatientKeyContext.Provider value={{ keys, setKeys }}>{children}</PatientKeyContext.Provider>;
}

export function usePatientKeys(): PatientKeyContextValue {
  const ctx = useContext(PatientKeyContext);
  if (!ctx) throw new Error("usePatientKeys must be used within PatientKeyProvider");
  return ctx;
}
