import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { decryptRecord, extractX25519PublicKeyMultibase } from "@/lib/crypto/recordCipher";
import { usePatientKeys } from "@/features/auth/PatientKeyContext";
import type { DidResolutionResult } from "@/types/did";
import type { DecryptedVc, RecordDetail, RecordSummary } from "../types";

/** Metadata list - the encrypted blob only comes back from the per-record detail call below. */
export function useMyRecords() {
  const { keys } = usePatientKeys();

  const recordsQuery = useQuery({
    queryKey: ["patient", "records"],
    queryFn: () => api.get<RecordSummary[]>("/patients/me/records"),
  });

  return {
    records: recordsQuery.data,
    isLoading: recordsQuery.isLoading,
    refetch: recordsQuery.refetch,
    isRefetching: recordsQuery.isRefetching,
    canDecrypt: !!keys,
  };
}

/**
 * Fetches and decrypts one record, cached by id - used both by the list
 * (to show a real title instead of a bare record id) and the detail
 * sheet, which hits the same cache entry instead of re-fetching and
 * re-decrypting. Decrypted content never changes for a given record, so
 * this is safe to cache indefinitely; `revoked` is read from the list
 * query instead (which does refetch), not from here.
 */
export function useDecryptedRecord(recordId: string | null) {
  const { keys } = usePatientKeys();

  return useQuery({
    queryKey: ["patient", "records", recordId, "decrypted"],
    queryFn: async (): Promise<{ detail: RecordDetail; vc: DecryptedVc }> => {
      if (!keys) throw new Error("Sign in again to decrypt records");

      const detail = await api.get<RecordDetail>(`/patients/me/records/${recordId}`);
      if (!detail.issuerDid || !detail.nonce) {
        throw new Error("This record predates issuer tracking and can't be decrypted");
      }

      const issuer = await api.get<DidResolutionResult>(`/dids/${encodeURIComponent(detail.issuerDid)}`);
      const issuerX25519 = extractX25519PublicKeyMultibase(issuer.didDocument);

      const plaintext = decryptRecord(keys.x25519PrivateKey, issuerX25519, detail.nonce, detail.encryptedBlob);
      const vc = JSON.parse(new TextDecoder().decode(plaintext)) as DecryptedVc;
      return { detail, vc };
    },
    enabled: !!recordId && !!keys,
    staleTime: Infinity,
    retry: false,
  });
}
