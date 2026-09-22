package ng.nehr.backend.credentials;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Generic ciphertext store, keyed by owner DID - server never holds the
 * key needed to decrypt {@code encryptedBlob}. For VCs, {@code nonce} is
 * the XChaCha20-Poly1305 nonce and the key is derived by the owner via
 * X25519 agreement with the issuer's public key, not stored here at all.
 */
@Entity
@Table(name = "encrypted_records")
public class EncryptedRecord {

    @Id
    @Column(name = "record_id")
    private String recordId;

    @Column(name = "owner_did", nullable = false)
    private String ownerDid;

    @Column(name = "issuer_did")
    private String issuerDid;

    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false)
    private RecordType recordType;

    @Column(name = "encrypted_blob", nullable = false)
    private byte[] encryptedBlob;

    @Column(name = "encrypted_key")
    private byte[] encryptedKey;

    @Column(name = "nonce")
    private byte[] nonce;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected EncryptedRecord() {
    }

    public EncryptedRecord(String recordId, String ownerDid, String issuerDid, RecordType recordType,
                            byte[] encryptedBlob, byte[] encryptedKey, byte[] nonce) {
        this.recordId = recordId;
        this.ownerDid = ownerDid;
        this.issuerDid = issuerDid;
        this.recordType = recordType;
        this.encryptedBlob = encryptedBlob;
        this.encryptedKey = encryptedKey;
        this.nonce = nonce;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public String getRecordId() {
        return recordId;
    }

    public String getOwnerDid() {
        return ownerDid;
    }

    public String getIssuerDid() {
        return issuerDid;
    }

    public RecordType getRecordType() {
        return recordType;
    }

    public byte[] getEncryptedBlob() {
        return encryptedBlob;
    }

    public byte[] getEncryptedKey() {
        return encryptedKey;
    }

    public byte[] getNonce() {
        return nonce;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
