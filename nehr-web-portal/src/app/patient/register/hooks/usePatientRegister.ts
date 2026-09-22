import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api/client";
import { buildSession, dashboardPathFor, setSession } from "@/lib/auth/session";
import { generatePatientKeyMaterial } from "@/lib/crypto/keys";
import { encryptPrivateKey, decryptPrivateKey } from "@/lib/crypto/patientVault";
import { usePatientKeys } from "../../lib/PatientKeyContext";
import { saveSelfCustodyIdentity } from "../../lib/selfCustodyIdentity";
import { performSelfCustodyLogin } from "../../lib/selfCustodyLogin";
import type { TokenPairResponse } from "@/types/auth";

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
 * decrypted keys into context - a bare "registration succeeded, now go
 * log in separately" step would be one extra click for no benefit here.
 */
export function usePatientRegister() {
  const router = useRouter();
  const { setKeys } = usePatientKeys();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const keys = generatePatientKeyMaterial();

      if (input.mode === "self") {
        const registration = await api.post<RegistrationResponse>("/auth/patients/register/self-custody", {
          ed25519PublicKey: keys.ed25519PublicKey,
          x25519PublicKey: keys.x25519PublicKey,
        });
        saveSelfCustodyIdentity({
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
    onSuccess: ({ tokens, keys }) => {
      const session = buildSession(tokens);
      setSession(session);
      setKeys({ ed25519PrivateKey: keys.ed25519PrivateKey, x25519PrivateKey: keys.x25519PrivateKey });
      toast.success("Welcome to NEHR");
      router.push(dashboardPathFor(session.actorType));
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not register")),
  });
}
