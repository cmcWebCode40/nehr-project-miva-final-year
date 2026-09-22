package ng.nehr.backend.credentials.dto;

import java.time.Instant;

public record IssueCredentialResponse(String recordId, String issuerDid, String patientDid, Instant issuedAt) {
}
