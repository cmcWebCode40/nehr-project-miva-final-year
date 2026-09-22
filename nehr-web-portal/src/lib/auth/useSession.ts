"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/types/auth";
import { clearSession, getSession, loginPathFor } from "./session";

/** Reactive read of the stored session, plus a logout helper that also clears it locally. */
export function useSession() {
  const [session, setSessionState] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Deliberately deferred to after mount, not a lazy useState initializer:
    // the server-rendered pass has no localStorage, so reading it during
    // render would desync from the client's first paint and trigger a
    // hydration mismatch. This is the one place that's the right call.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionState(getSession());
    setHydrated(true);
  }, []);

  const logout = useCallback(() => {
    const actorType = session?.actorType;
    clearSession();
    setSessionState(null);
    router.push(actorType ? loginPathFor(actorType) : "/");
  }, [router, session?.actorType]);

  return { session, hydrated, logout };
}
