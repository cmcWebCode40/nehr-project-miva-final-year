export type DoctorStatus = "ACTIVE" | "SUSPENDED" | "REMOVED";

export interface DoctorSummary {
  doctorDid: string;
  fullName: string;
  email: string;
  role: string;
  department: string | null;
  status: DoctorStatus;
}

export interface CreateDoctorInput {
  fullName: string;
  email: string;
  role: string;
  department?: string;
  licenceNumber?: string;
  defaultPassword: string;
  adminPassword: string;
}
