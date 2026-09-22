import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api/client";
import { bytesToBase64 } from "@/lib/crypto/encoding";
import { signEd25519 } from "@/lib/crypto/keys";
import { usePatientKeys } from "../../../lib/PatientKeyContext";
import type { ConsentSummary } from "../types";

const CONSENTS_KEY = ["patient", "consents"];

/** Consolidated: listing, accepting (client-side Ed25519 signature), and revoking the patient's own consent requests. */
export function useMyConsents() {
  const queryClient = useQueryClient();
  const { keys } = usePatientKeys();

  const consentsQuery = useQuery({
    queryKey: CONSENTS_KEY,
    queryFn: () => api.get<ConsentSummary[]>("/patients/me/consents"),
  });

  const acceptConsent = useMutation({
    mutationFn: async (consent: ConsentSummary) => {
      if (!keys) throw new Error("Sign in again to accept consent requests");
      if (!consent.signingPayload) throw new Error("This request is no longer pending");
      const signature = signEd25519(keys.ed25519PrivateKey, new TextEncoder().encode(consent.signingPayload));
      return api.post<ConsentSummary>(`/patients/me/consents/${consent.consentId}/accept`, {
        signature: bytesToBase64(signature),
      });
    },
    onSuccess: () => {
      toast.success("Consent granted");
      queryClient.invalidateQueries({ queryKey: CONSENTS_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not accept consent request")),
  });

  const revokeConsent = useMutation({
    mutationFn: (consentId: string) => api.post<ConsentSummary>(`/patients/me/consents/${consentId}/revoke`),
    onSuccess: () => {
      toast.success("Consent revoked");
      queryClient.invalidateQueries({ queryKey: CONSENTS_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not revoke consent")),
  });

  return {
    consents: consentsQuery.data,
    isLoading: consentsQuery.isLoading,
    canSign: !!keys,
    acceptConsent,
    revokeConsent,
  };
}
