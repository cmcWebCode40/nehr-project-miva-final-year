package ng.nehr.backend.credentials.dto;

import java.time.Instant;

/**
 * The server can only ever report metadata here - {@code resourceType} and
 * every other content field live inside the encrypted blob, which the
 * issuing hospital cannot re-read once submitted (see TECH_DEBT.md).
 */
public record CredentialSummaryResponse(String recordId, String patientDid, Instant issuedAt, boolean revoked) {
}
