import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api/client";
import { buildSession, dashboardPathFor, setSession } from "@/lib/auth/session";
import { decryptPrivateKey } from "@/lib/crypto/patientVault";
import { usePatientKeys } from "../../lib/PatientKeyContext";
import { getSelfCustodyIdentity, type SelfCustodyIdentity } from "../../lib/selfCustodyIdentity";
import { performSelfCustodyLogin } from "../../lib/selfCustodyLogin";
import type { TokenPairResponse } from "@/types/auth";

interface ManagedCustodyLoginResponse {
  tokens: TokenPairResponse;
  encryptedPrivateKeyEd: string;
  encryptedPrivateKeyX25: string;
}

export function usePatientLogin() {
  const router = useRouter();
  const { setKeys } = usePatientKeys();
  const [storedIdentity, setStoredIdentity] = useState<SelfCustodyIdentity | null>(null);

  useEffect(() => {
    // Deferred to after mount, same reasoning as useSession: the
    // server-rendered pass has no localStorage to read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStoredIdentity(getSelfCustodyIdentity());
  }, []);

  const afterLogin = (tokens: TokenPairResponse, keys: { ed25519PrivateKey: string; x25519PrivateKey: string }) => {
    const session = buildSession(tokens);
    setSession(session);
    setKeys(keys);
    toast.success("Welcome back");
    router.push(dashboardPathFor(session.actorType));
  };

  const managedLogin = useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const login = await api.post<ManagedCustodyLoginResponse>("/auth/patients/login", input);
      const [ed25519PrivateKey, x25519PrivateKey] = await Promise.all([
        decryptPrivateKey(input.password, login.encryptedPrivateKeyEd),
        decryptPrivateKey(input.password, login.encryptedPrivateKeyX25),
      ]);
      return { tokens: login.tokens, keys: { ed25519PrivateKey, x25519PrivateKey } };
    },
    onSuccess: ({ tokens, keys }) => afterLogin(tokens, keys),
    onError: (error) => toast.error(apiErrorMessage(error, "Invalid email or password")),
  });

  const selfCustodyLogin = useMutation({
    mutationFn: async () => {
      const identity = getSelfCustodyIdentity();
      if (!identity) throw new Error("No device identity found on this browser");
      const tokens = await performSelfCustodyLogin(identity.did, identity.ed25519PrivateKey);
      return {
        tokens,
        keys: { ed25519PrivateKey: identity.ed25519PrivateKey, x25519PrivateKey: identity.x25519PrivateKey },
      };
    },
    onSuccess: ({ tokens, keys }) => afterLogin(tokens, keys),
    onError: (error) => toast.error(apiErrorMessage(error, "Could not sign in with this device")),
  });

  return { managedLogin, selfCustodyLogin, storedIdentity };
}
