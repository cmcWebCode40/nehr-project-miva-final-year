import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import type { Session } from "@/types/auth";
import { clearSession, getSession } from "@/lib/auth/session";
import { usePatientKeys } from "./PatientKeyContext";

/** Reactive read of the stored session, plus a logout helper that also clears it and the in-memory keys. */
export function useSession() {
  const [session, setSessionState] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const { setKeys } = usePatientKeys();

  useEffect(() => {
    let cancelled = false;
    getSession().then((value) => {
      if (cancelled) return;
      setSessionState(value);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setKeys(null);
    setSessionState(null);
    router.replace("/login");
  }, [setKeys]);

  return { session, hydrated, logout };
}
