package ng.nehr.backend.credentials;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/** {@code vcId} is the issuing {@code EncryptedRecord.recordId} - the VC payload itself carries no separate identifier. */
@Entity
@Table(name = "revoked_credentials")
public class RevokedCredential {

    @Id
    @Column(name = "vc_id")
    private String vcId;

    @Column(name = "revoked_by", nullable = false)
    private String revokedBy;

    @Column(name = "revoked_at", nullable = false, updatable = false)
    private Instant revokedAt;

    @Column(name = "reason")
    private String reason;

    protected RevokedCredential() {
    }

    public RevokedCredential(String vcId, String revokedBy, String reason) {
        this.vcId = vcId;
        this.revokedBy = revokedBy;
        this.reason = reason;
    }

    @PrePersist
    void onCreate() {
        revokedAt = Instant.now();
    }

    public String getVcId() {
        return vcId;
    }

    public String getRevokedBy() {
        return revokedBy;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public String getReason() {
        return reason;
    }
}
