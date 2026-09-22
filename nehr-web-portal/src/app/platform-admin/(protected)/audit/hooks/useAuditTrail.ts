import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { AuditEntry } from "@/types/audit";

export function useAuditTrail() {
  const query = useQuery({
    queryKey: ["platform-admin", "audit-trail"],
    queryFn: () => api.get<AuditEntry[]>("/platform-admin/audit-trail", { limit: 200 }),
  });

  return { entries: query.data, isLoading: query.isLoading };
}
