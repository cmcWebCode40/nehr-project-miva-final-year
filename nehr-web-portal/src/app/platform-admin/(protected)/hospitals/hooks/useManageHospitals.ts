import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api/client";
import type { HospitalSummary } from "../types";

const HOSPITALS_KEY = ["platform-admin", "hospitals"];

/** Consolidated: listing + approving hospitals, one hook per the brief's domain-hook convention. */
export function useManageHospitals() {
  const queryClient = useQueryClient();

  const hospitalsQuery = useQuery({
    queryKey: HOSPITALS_KEY,
    queryFn: () => api.get<HospitalSummary[]>("/platform-admin/hospitals"),
  });

  const approve = useMutation({
    mutationFn: (hospitalDid: string) =>
      api.post<HospitalSummary>(`/platform-admin/hospitals/${hospitalDid}/approve`),
    onSuccess: (hospital) => {
      toast.success(`${hospital.hospitalName} approved`);
      queryClient.invalidateQueries({ queryKey: HOSPITALS_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not approve hospital")),
  });

  return {
    hospitals: hospitalsQuery.data,
    isLoading: hospitalsQuery.isLoading,
    approve: approve.mutate,
    approvingId: approve.isPending ? approve.variables : undefined,
  };
}
