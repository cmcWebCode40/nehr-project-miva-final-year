import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api/client";
import type { CreateDoctorInput, DoctorSummary } from "../types";

const STAFF_KEY = ["hospital-admin", "staff"];

/** Consolidated: listing + adding doctors, one hook per the brief's domain-hook convention. */
export function useManageStaff() {
  const queryClient = useQueryClient();

  const staffQuery = useQuery({
    queryKey: STAFF_KEY,
    queryFn: () => api.get<DoctorSummary[]>("/hospitals/me/doctors"),
  });

  const addDoctor = useMutation({
    mutationFn: (input: CreateDoctorInput) => api.post<DoctorSummary>("/hospitals/me/doctors", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not add staff member")),
  });

  return {
    staff: staffQuery.data,
    isLoading: staffQuery.isLoading,
    addDoctor,
  };
}
