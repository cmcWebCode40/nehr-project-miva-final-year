export type ConsentStatus = "PENDING" | "GRANTED" | "REVOKED" | "EXPIRED";

export interface ConsentSummary {
  consentId: string;
  grantorDid: string;
  granteeDid: string;
  requestedBy: string;
  scope: string[];
  purpose: string | null;
  validFrom: string | null;
  validUntil: string | null;
  status: ConsentStatus;
  grantedAt: string | null;
  signingPayload: string | null;
}

export interface RequestConsentInput {
  patientDid: string;
  scope: string[];
  purpose?: string;
  validityDays?: number;
}
