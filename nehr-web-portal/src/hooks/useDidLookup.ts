"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { DidResolutionResult } from "@/types/did";

/**
 * Shared by the public DID Lookup page and the staff convenience page -
 * both hit the same unauthenticated GET /dids/{did} endpoint (FR-06/DID
 * registry resolution never requires contacting anyone but the registry).
 */
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
