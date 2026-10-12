import { api, apiErrorMessage } from "@/lib/api/client";
import { buildSession, setSession } from "@/lib/auth/session";
import { generatePatientKeyMaterial } from "@/lib/crypto/keys";
import { decryptPrivateKey, encryptPrivateKey } from "@/lib/crypto/patientVault";
import type { TokenPairResponse } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import { usePatientKeys } from "../PatientKeyContext";
import { saveSelfCustodyIdentity } from "../selfCustodyIdentity";
import { performSelfCustodyLogin } from "../selfCustodyLogin";

interface RegistrationResponse {
  did: string;
  custodyType: "SELF" | "MANAGED";
}

interface ManagedCustodyLoginResponse {
  tokens: TokenPairResponse;
  encryptedPrivateKeyEd: string;
  encryptedPrivateKeyX25: string;
}

type RegisterInput = { mode: "self" } | { mode: "managed"; email: string; password: string };

/**
 * Registers, then immediately signs the patient in and loads their
 * decrypted keys into context - a bare "registration succeeded, now go log
 * in separately" step would be one extra step for no benefit here.
 */
export function usePatientRegister() {
  const { setKeys } = usePatientKeys();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const keys = generatePatientKeyMaterial();
      console.log(keys);
      

      if (input.mode === "self") {
        const registration = await api.post<RegistrationResponse>("/auth/patients/register/self-custody", {
          ed25519PublicKey: keys.ed25519PublicKey,
          x25519PublicKey: keys.x25519PublicKey,
        });
        await saveSelfCustodyIdentity({
          did: registration.did,
          ed25519PrivateKey: keys.ed25519PrivateKey,
          x25519PrivateKey: keys.x25519PrivateKey,
        });
        const tokens = await performSelfCustodyLogin(registration.did, keys.ed25519PrivateKey);
        return { tokens, keys };
      }
      
      const [encryptedPrivateKeyEd, encryptedPrivateKeyX25] = await Promise.all([
        encryptPrivateKey(input.password, keys.ed25519PrivateKey),
        encryptPrivateKey(input.password, keys.x25519PrivateKey),
      ]);
      await api.post<RegistrationResponse>("/auth/patients/register/managed-custody", {
        email: input.email,
        password: input.password,
        ed25519PublicKey: keys.ed25519PublicKey,
        x25519PublicKey: keys.x25519PublicKey,
        encryptedPrivateKeyEd,
        encryptedPrivateKeyX25,
      });
      const login = await api.post<ManagedCustodyLoginResponse>("/auth/patients/login", {
        email: input.email,
        password: input.password,
      });
      const [ed25519PrivateKey, x25519PrivateKey] = await Promise.all([
        decryptPrivateKey(input.password, login.encryptedPrivateKeyEd),
        decryptPrivateKey(input.password, login.encryptedPrivateKeyX25),
      ]);
      return { tokens: login.tokens, keys: { ed25519PrivateKey, x25519PrivateKey } };
    },
    onSuccess: async ({ tokens, keys }) => {
      const session = buildSession(tokens);
      await setSession(session);
      setKeys({ ed25519PrivateKey: keys.ed25519PrivateKey, x25519PrivateKey: keys.x25519PrivateKey });
      router.replace("/(protected)/dashboard");
    },
    onError: (error) => Alert.alert("Could not register", apiErrorMessage(error, "Could not register")),
  });
}
