import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api/client";
import { buildSession, dashboardPathFor, setSession } from "@/lib/auth/session";
import type { TokenPairResponse } from "@/types/auth";

interface LoginInput {
  email: string;
  password: string;
}

export function useStaffLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => api.post<TokenPairResponse>("/auth/doctors/login", input),
    onSuccess: (tokens) => {
      const session = buildSession(tokens);
      setSession(session);
      toast.success("Welcome back");
      router.push(dashboardPathFor(session.actorType));
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Invalid email or password"));
    },
  });
}
