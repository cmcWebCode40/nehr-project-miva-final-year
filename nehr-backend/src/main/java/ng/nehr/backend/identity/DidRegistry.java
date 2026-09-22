package ng.nehr.backend.identity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "did_registry")
public class DidRegistry {

    @Id
    @Column(name = "did")
    private String did;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private EntityType entityType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "did_document", nullable = false)
    private Map<String, Object> didDocument;

    @Column(name = "public_key_ed", nullable = false)
    private String publicKeyEd;

    @Column(name = "public_key_x25", nullable = false)
    private String publicKeyX25;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DidStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected DidRegistry() {
    }

    public DidRegistry(String did, EntityType entityType, Map<String, Object> didDocument,
                        String publicKeyEd, String publicKeyX25) {
        this.did = did;
        this.entityType = entityType;
        this.didDocument = didDocument;
        this.publicKeyEd = publicKeyEd;
        this.publicKeyX25 = publicKeyX25;
        this.status = DidStatus.ACTIVE;
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

    public void deactivate() {
        this.status = DidStatus.DEACTIVATED;
    }

    public String getDid() {
        return did;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public Map<String, Object> getDidDocument() {
        return didDocument;
    }

    public String getPublicKeyEd() {
        return publicKeyEd;
    }

    public String getPublicKeyX25() {
        return publicKeyX25;
    }

    public DidStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
