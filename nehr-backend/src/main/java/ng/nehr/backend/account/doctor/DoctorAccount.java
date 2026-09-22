package ng.nehr.backend.account.doctor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "doctor_accounts")
public class DoctorAccount {

    @Id
    @Column(name = "doctor_did")
    private String doctorDid;

    @Column(name = "hospital_did", nullable = false)
    private String hospitalDid;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "department")
    private String department;

    @Column(name = "licence_number")
    private String licenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DoctorStatus status;

    @Column(name = "token_version", nullable = false)
    private int tokenVersion;

    @Column(name = "encrypted_priv_ed", nullable = false)
    private byte[] encryptedPrivEd;

    @Column(name = "encrypted_priv_x25", nullable = false)
    private byte[] encryptedPrivX25;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected DoctorAccount() {
    }

    public DoctorAccount(String doctorDid, String hospitalDid, String fullName, String email,
                          String passwordHash, String role, String department, String licenceNumber,
                          byte[] encryptedPrivEd, byte[] encryptedPrivX25) {
        this.doctorDid = doctorDid;
        this.hospitalDid = hospitalDid;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.department = department;
        this.licenceNumber = licenceNumber;
        this.encryptedPrivEd = encryptedPrivEd;
        this.encryptedPrivX25 = encryptedPrivX25;
        this.status = DoctorStatus.ACTIVE;
        this.tokenVersion = 0;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public void suspend() {
        this.status = DoctorStatus.SUSPENDED;
        this.tokenVersion++;
    }

    public void remove() {
        this.status = DoctorStatus.REMOVED;
        this.tokenVersion++;
    }

    public void reactivate() {
        this.status = DoctorStatus.ACTIVE;
    }

    public String getDoctorDid() {
        return doctorDid;
    }

    public String getHospitalDid() {
        return hospitalDid;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getRole() {
        return role;
    }

    public String getDepartment() {
        return department;
    }

    public String getLicenceNumber() {
        return licenceNumber;
    }

    public DoctorStatus getStatus() {
        return status;
    }

    public int getTokenVersion() {
        return tokenVersion;
    }

    public byte[] getEncryptedPrivEd() {
        return encryptedPrivEd;
    }

    public byte[] getEncryptedPrivX25() {
        return encryptedPrivX25;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
