package ng.nehr.backend.consent.dto;

import ng.nehr.backend.consent.ConsentRecord;
import ng.nehr.backend.consent.ConsentStatus;

import java.time.Instant;
import java.util.List;

public record ConsentResponse(
        String consentId,
        String grantorDid,
        String granteeDid,
        String requestedBy,
        List<String> scope,
        String purpose,
        Instant validFrom,
        Instant validUntil,
        ConsentStatus status,
        Instant grantedAt,
        String signingPayload) {

    public static ConsentResponse from(ConsentRecord record) {
        return new ConsentResponse(
                record.getConsentId(),
                record.getGrantorDid(),
                record.getGranteeDid(),
                record.getRequestedBy(),
                record.getScope(),
                record.getPurpose(),
                record.getValidFrom(),
                record.getValidUntil(),
                record.getStatus(),
                record.getGrantedAt(),
                record.getStatus() == ConsentStatus.PENDING ? record.canonicalSigningPayload() : null);
    }
}
