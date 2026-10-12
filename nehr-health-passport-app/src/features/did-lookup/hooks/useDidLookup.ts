import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { DidResolutionResult } from "@/types/did";

/** Public, unauthenticated `GET /dids/{did}` resolution - same endpoint the web portal's lookup page hits. */
export function useDidLookup() {
  const [submittedDid, setSubmittedDid] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["did-lookup", submittedDid],
    queryFn: () => api.get<DidResolutionResult>(`/dids/${encodeURIComponent(submittedDid!)}`),
    enabled: !!submittedDid,
    retry: false,
  });

  return {
    lookup: (did: string) => setSubmittedDid(did.trim()),
    result: query.data,
    isLoading: query.isFetching,
    isError: query.isError,
    hasSearched: submittedDid !== null,
  };
}
