package ng.nehr.backend.account.hospital;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "hospital_accounts")
public class HospitalAccount {

    @Id
    @Column(name = "hospital_did")
    private String hospitalDid;

    @Column(name = "hospital_name", nullable = false)
    private String hospitalName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "encrypted_sign_key", nullable = false)
    private byte[] encryptedSignKey;

    @Column(name = "encrypted_enc_key", nullable = false)
    private byte[] encryptedEncKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HospitalStatus status;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected HospitalAccount() {
    }

    public HospitalAccount(String hospitalDid, String hospitalName, String email, String passwordHash,
                            byte[] encryptedSignKey, byte[] encryptedEncKey) {
        this.hospitalDid = hospitalDid;
        this.hospitalName = hospitalName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.encryptedSignKey = encryptedSignKey;
        this.encryptedEncKey = encryptedEncKey;
        this.status = HospitalStatus.PENDING;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public void approve(String approvedByAdminId) {
        this.status = HospitalStatus.APPROVED;
        this.approvedAt = Instant.now();
        this.approvedBy = approvedByAdminId;
    }

    public void suspend() {
        this.status = HospitalStatus.SUSPENDED;
    }

    public String getHospitalDid() {
        return hospitalDid;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public byte[] getEncryptedSignKey() {
        return encryptedSignKey;
    }

    public byte[] getEncryptedEncKey() {
        return encryptedEncKey;
    }

    public HospitalStatus getStatus() {
        return status;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
