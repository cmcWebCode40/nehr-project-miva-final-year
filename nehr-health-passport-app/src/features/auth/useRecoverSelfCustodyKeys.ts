import { useEffect } from "react";
import { useSession } from "./useSession";
import { usePatientKeys } from "./PatientKeyContext";
import { getSelfCustodyIdentity } from "./selfCustodyIdentity";

/**
 * Recovers a self-custody patient's key material after the app is
 * relaunched (which resets the in-memory `PatientKeyContext`) by reloading
 * it from secure device storage - no re-login needed since the session
 * token is still valid. Managed-custody patients have no equivalent: their
 * keys only ever exist in memory, re-derived from a password, so a
 * relaunch genuinely requires signing in again.
 */
export function useRecoverSelfCustodyKeys() {
  const { session } = useSession();
  const { keys, setKeys } = usePatientKeys();

  useEffect(() => {
    if (keys || !session) return;
    let cancelled = false;
    getSelfCustodyIdentity().then((identity) => {
      if (cancelled || !identity || identity.did !== session.subject) return;
      setKeys({ ed25519PrivateKey: identity.ed25519PrivateKey, x25519PrivateKey: identity.x25519PrivateKey });
    });
    return () => {
      cancelled = true;
    };
  }, [keys, session, setKeys]);
}
