package ng.nehr.backend.account.hospital;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * One entry per person who can unwrap a hospital's shared DEK: the
 * hospital admin, and every doctor added afterward. Wrapping the same DEK
 * separately under each principal's own Argon2id-derived key lets any of
 * them trigger hospital-signed VC issuance with only their own password,
 * and lets removing one principal's access (revoked_at) happen without
 * touching anyone else's grant or the hospital's actual signing key.
 */
@Entity
@Table(name = "hospital_key_grants")
public class HospitalKeyGrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hospital_did", nullable = false)
    private String hospitalDid;

    @Column(name = "principal_did", nullable = false)
    private String principalDid;

    @Column(name = "wrapped_dek", nullable = false)
    private byte[] wrappedDek;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected HospitalKeyGrant() {
    }

    public HospitalKeyGrant(String hospitalDid, String principalDid, byte[] wrappedDek) {
        this.hospitalDid = hospitalDid;
        this.principalDid = principalDid;
        this.wrappedDek = wrappedDek;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public void revoke() {
        this.revokedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getHospitalDid() {
        return hospitalDid;
    }

    public String getPrincipalDid() {
        return principalDid;
    }

    public byte[] getWrappedDek() {
        return wrappedDek;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }
}
