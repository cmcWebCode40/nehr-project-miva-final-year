package ng.nehr.backend.credentials.dto;

import ng.nehr.backend.credentials.EncryptedRecord;
import ng.nehr.backend.credentials.RecordType;

import java.time.Instant;

public record PatientRecordSummary(
        String recordId, String issuerDid, RecordType recordType, Instant createdAt, boolean revoked) {

    public static PatientRecordSummary from(EncryptedRecord record, boolean revoked) {
        return new PatientRecordSummary(
                record.getRecordId(), record.getIssuerDid(), record.getRecordType(), record.getCreatedAt(), revoked);
    }
}
