package ng.nehr.backend.credentials.dto;

import ng.nehr.backend.credentials.EncryptedRecord;
import ng.nehr.backend.credentials.RecordType;

import java.time.Instant;
import java.util.Base64;

/**
 * Ciphertext + nonce so the owning patient's app can derive the shared
 * key via X25519 agreement (its own private key + the issuer DID's public
 * key) and decrypt locally - the server cannot do this itself.
 */
public record PatientRecordDetail(
        String recordId,
        String issuerDid,
        RecordType recordType,
        String encryptedBlob,
        String nonce,
        Instant createdAt,
        boolean revoked) {

    public static PatientRecordDetail from(EncryptedRecord record, boolean revoked) {
        return new PatientRecordDetail(
                record.getRecordId(),
                record.getIssuerDid(),
                record.getRecordType(),
                Base64.getEncoder().encodeToString(record.getEncryptedBlob()),
                record.getNonce() != null ? Base64.getEncoder().encodeToString(record.getNonce()) : null,
                record.getCreatedAt(),
                revoked);
    }
}
