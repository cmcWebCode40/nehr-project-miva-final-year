import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api/client";
import type { ConsentSummary, RequestConsentInput } from "../types";

const CONSENTS_KEY = ["staff", "consents"];

/** Consolidated: requesting + listing consents, one hook per the brief's domain-hook convention. */
export function useConsents() {
  const queryClient = useQueryClient();

  const consentsQuery = useQuery({
    queryKey: CONSENTS_KEY,
    queryFn: () => api.get<ConsentSummary[]>("/doctors/me/consents"),
  });

  const requestConsent = useMutation({
    mutationFn: (input: RequestConsentInput) => api.post<ConsentSummary>("/doctors/me/consents", input),
    onSuccess: () => {
      toast.success("Consent request sent");
      queryClient.invalidateQueries({ queryKey: CONSENTS_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not request consent")),
  });

  return {
    consents: consentsQuery.data,
    isLoading: consentsQuery.isLoading,
    requestConsent,
  };
}
