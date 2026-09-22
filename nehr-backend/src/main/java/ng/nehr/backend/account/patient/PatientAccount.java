package ng.nehr.backend.account.patient;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "patient_accounts")
public class PatientAccount {

    @Id
    @Column(name = "did")
    private String did;

    @Enumerated(EnumType.STRING)
    @Column(name = "custody_type", nullable = false)
    private CustodyType custodyType;

    @Column(name = "email")
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "encrypted_priv_ed")
    private byte[] encryptedPrivEd;

    @Column(name = "encrypted_priv_x25")
    private byte[] encryptedPrivX25;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected PatientAccount() {
    }

    public static PatientAccount selfCustody(String did) {
        PatientAccount account = new PatientAccount();
        account.did = did;
        account.custodyType = CustodyType.SELF;
        return account;
    }

    public static PatientAccount managedCustody(String did, String email, String passwordHash,
                                                 byte[] encryptedPrivEd, byte[] encryptedPrivX25) {
        PatientAccount account = new PatientAccount();
        account.did = did;
        account.custodyType = CustodyType.MANAGED;
        account.email = email;
        account.passwordHash = passwordHash;
        account.encryptedPrivEd = encryptedPrivEd;
        account.encryptedPrivX25 = encryptedPrivX25;
        return account;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public String getDid() {
        return did;
    }

    public CustodyType getCustodyType() {
        return custodyType;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
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
