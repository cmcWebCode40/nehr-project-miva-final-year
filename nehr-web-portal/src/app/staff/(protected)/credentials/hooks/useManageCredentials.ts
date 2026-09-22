import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api/client";
import type { CredentialSummary, IssueCredentialInput, IssueCredentialResult } from "../types";

const CREDENTIALS_KEY = ["staff", "credentials"];

/** Consolidated: listing, issuing, and revoking credentials issued by this doctor's hospital. */
export function useManageCredentials() {
  const queryClient = useQueryClient();

  const credentialsQuery = useQuery({
    queryKey: CREDENTIALS_KEY,
    queryFn: () => api.get<CredentialSummary[]>("/doctors/me/credentials"),
  });

  const issueCredential = useMutation({
    mutationFn: ({ patientDid, ...body }: IssueCredentialInput) =>
      api.post<IssueCredentialResult>(`/doctors/me/patients/${patientDid}/credentials`, body),
    onSuccess: () => {
      toast.success("Credential issued and encrypted for the patient");
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not issue credential")),
  });

  const revokeCredential = useMutation({
    mutationFn: (recordId: string) => api.post<void>(`/doctors/me/credentials/${recordId}/revoke`, {}),
    onSuccess: () => {
      toast.success("Credential revoked");
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not revoke credential")),
  });

  return {
    credentials: credentialsQuery.data,
    isLoading: credentialsQuery.isLoading,
    issueCredential,
    revokeCredential,
  };
}
