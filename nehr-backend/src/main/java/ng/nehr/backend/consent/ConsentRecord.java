package ng.nehr.backend.consent;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "consent_records")
public class ConsentRecord {

    @Id
    @Column(name = "consent_id")
    private String consentId;

    @Column(name = "grantor_did", nullable = false)
    private String grantorDid;

    @Column(name = "grantee_did", nullable = false)
    private String granteeDid;

    @Column(name = "requested_by")
    private String requestedBy;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scope", nullable = false)
    private List<String> scope;

    @Column(name = "purpose")
    private String purpose;

    @Column(name = "valid_from")
    private Instant validFrom;

    @Column(name = "valid_until")
    private Instant validUntil;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ConsentStatus status;

    @Column(name = "granted_at")
    private Instant grantedAt;

    @Column(name = "patient_signature", columnDefinition = "TEXT")
    private String patientSignature;

    protected ConsentRecord() {
    }

    public ConsentRecord(String consentId, String grantorDid, String granteeDid, String requestedBy,
                          List<String> scope, String purpose, Instant validFrom, Instant validUntil) {
        this.consentId = consentId;
        this.grantorDid = grantorDid;
        this.granteeDid = granteeDid;
        this.requestedBy = requestedBy;
        this.scope = scope;
        this.purpose = purpose;
        this.validFrom = validFrom;
        this.validUntil = validUntil;
        this.status = ConsentStatus.PENDING;
    }

    public void grant(String patientSignature) {
        this.status = ConsentStatus.GRANTED;
        this.grantedAt = Instant.now();
        this.patientSignature = patientSignature;
    }

    public void revoke() {
        this.status = ConsentStatus.REVOKED;
    }

    public boolean isActiveFor(String resourceType) {
        if (status != ConsentStatus.GRANTED) {
            return false;
        }
        if (validUntil != null && validUntil.isBefore(Instant.now())) {
            return false;
        }
        return scope.contains(resourceType);
    }

    /** Deterministic string the patient signs client-side to grant this request - see credentials module for the same pattern applied to VC proofs. */
    public String canonicalSigningPayload() {
        return String.join("|",
                consentId, grantorDid, granteeDid,
                String.join(",", scope),
                purpose == null ? "" : purpose,
                validFrom == null ? "" : String.valueOf(validFrom.toEpochMilli()),
                validUntil == null ? "" : String.valueOf(validUntil.toEpochMilli()));
    }

    public String getConsentId() {
        return consentId;
    }

    public String getGrantorDid() {
        return grantorDid;
    }

    public String getGranteeDid() {
        return granteeDid;
    }

    public String getRequestedBy() {
        return requestedBy;
    }

    public List<String> getScope() {
        return scope;
    }

    public String getPurpose() {
        return purpose;
    }

    public Instant getValidFrom() {
        return validFrom;
    }

    public Instant getValidUntil() {
        return validUntil;
    }

    public ConsentStatus getStatus() {
        return status;
    }

    public Instant getGrantedAt() {
        return grantedAt;
    }

    public String getPatientSignature() {
        return patientSignature;
    }
}
