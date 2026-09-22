export type HospitalStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export interface HospitalSummary {
  hospitalDid: string;
  hospitalName: string;
  email: string;
  status: HospitalStatus;
  approvedAt: string | null;
  approvedBy: string | null;
}
