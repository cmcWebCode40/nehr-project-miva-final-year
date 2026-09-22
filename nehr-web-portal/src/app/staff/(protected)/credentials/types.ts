export interface IssueCredentialInput {
  patientDid: string;
  resourceType: string;
  content: Record<string, unknown>;
  doctorPassword: string;
}

export interface IssueCredentialResult {
  recordId: string;
  issuerDid: string;
  patientDid: string;
  issuedAt: string;
}

export interface CredentialSummary {
  recordId: string;
  patientDid: string;
  issuedAt: string;
  revoked: boolean;
}
