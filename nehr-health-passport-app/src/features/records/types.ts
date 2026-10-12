export type RecordType = "VC" | "CONSENT_LOG" | "HOSPITAL_VISIT" | "AUDIT_ENTRY";

export interface RecordSummary {
  recordId: string;
  issuerDid: string | null;
  recordType: RecordType;
  createdAt: string;
  revoked: boolean;
}

export interface RecordDetail {
  recordId: string;
  issuerDid: string | null;
  recordType: RecordType;
  encryptedBlob: string;
  nonce: string | null;
  createdAt: string;
  revoked: boolean;
}

/** The decrypted shape `VerifiableCredentialCodec.build` produces on the backend. */
export interface DecryptedVc {
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id: string;
    resourceType: string;
    recordedBy: { doctorDid: string; fullName: string; licenceNumber: string };
    content: Record<string, unknown>;
  };
  proof: { type: string; created: string; verificationMethod: string };
}
