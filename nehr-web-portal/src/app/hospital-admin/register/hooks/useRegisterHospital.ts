import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api/client";
import { generateHospitalKeyMaterial } from "@/lib/crypto/keys";

interface RegisterHospitalInput {
  hospitalName: string;
  email: string;
  password: string;
}

interface HospitalRegistrationResponse {
  hospitalDid: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED";
}

/**
 * The hospital's Ed25519 (signing) and X25519 (encryption) keypairs are
 * generated here, client-side, and both public and private keys are sent
 * once at registration - the server encrypts the private keys under a
 * generated DEK from that point on, it never generates them itself.
 */
export function useRegisterHospital() {
  return useMutation({
    mutationFn: async (input: RegisterHospitalInput) => {
      const keys = generateHospitalKeyMaterial();
      return api.post<HospitalRegistrationResponse>("/auth/hospitals/register", {
        ...input,
        ...keys,
      });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Could not register hospital")),
  });
}
