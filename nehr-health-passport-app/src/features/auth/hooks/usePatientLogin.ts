import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import { api, apiErrorMessage } from "@/lib/api/client";
import { buildSession, setSession } from "@/lib/auth/session";
import { decryptPrivateKey } from "@/lib/crypto/patientVault";
import { usePatientKeys } from "../PatientKeyContext";
import { getSelfCustodyIdentity, type SelfCustodyIdentity } from "../selfCustodyIdentity";
import { performSelfCustodyLogin } from "../selfCustodyLogin";
import type { TokenPairResponse } from "@/types/auth";

interface ManagedCustodyLoginResponse {
  tokens: TokenPairResponse;
  encryptedPrivateKeyEd: string;
  encryptedPrivateKeyX25: string;
}

export function usePatientLogin() {
  const { setKeys } = usePatientKeys();
  const [storedIdentity, setStoredIdentity] = useState<SelfCustodyIdentity | null>(null);
  const [checkingDevice, setCheckingDevice] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSelfCustodyIdentity().then((identity) => {
      if (cancelled) return;
      setStoredIdentity(identity);
      setCheckingDevice(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const afterLogin = async (tokens: TokenPairResponse, keys: { ed25519PrivateKey: string; x25519PrivateKey: string }) => {
    const session = buildSession(tokens);
    await setSession(session);
    setKeys(keys);
    router.replace("/(protected)/dashboard");
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
    onError: (error) => Alert.alert("Sign in failed", apiErrorMessage(error, "Invalid email or password")),
  });

  const selfCustodyLogin = useMutation({
    mutationFn: async () => {
      const identity = await getSelfCustodyIdentity();
      if (!identity) throw new Error("No device identity found on this device");
      const tokens = await performSelfCustodyLogin(identity.did, identity.ed25519PrivateKey);
      return {
        tokens,
        keys: { ed25519PrivateKey: identity.ed25519PrivateKey, x25519PrivateKey: identity.x25519PrivateKey },
      };
    },
    onSuccess: ({ tokens, keys }) => afterLogin(tokens, keys),
    onError: (error) => Alert.alert("Sign in failed", apiErrorMessage(error, "Could not sign in with this device")),
  });

  return { managedLogin, selfCustodyLogin, storedIdentity, checkingDevice };
}
