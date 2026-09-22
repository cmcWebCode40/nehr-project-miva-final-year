package ng.nehr.backend.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

/**
 * Hash-chained audit log (ch.3.5.2/3.5.3): each entry's previous_hash is
 * BLAKE3 over the prior entry's own canonical fields (including *its*
 * previous_hash), so altering any historical entry breaks every hash from
 * that point forward. Basic coverage only - see TECH_DEBT.md for what
 * isn't logged yet.
 */
@Entity
@Table(name = "audit_trail")
public class AuditTrail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "entry_id")
    private Long entryId;

    @Column(name = "actor_did")
    private String actorDid;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "target_did")
    private String targetDid;

    @Column(name = "target_type")
    private String targetType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details")
    private Map<String, Object> details;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "previous_hash")
    private String previousHash;

    protected AuditTrail() {
    }

    public AuditTrail(String actorDid, String action, String targetDid, String targetType,
                       Map<String, Object> details, String previousHash) {
        this.actorDid = actorDid;
        this.action = action;
        this.targetDid = targetDid;
        this.targetType = targetType;
        this.details = details;
        this.previousHash = previousHash;
    }

    @PrePersist
    void onCreate() {
        occurredAt = Instant.now();
    }

    /** The string this entry's own hash is computed over, for chaining into the next entry. */
    public String canonicalPayload() {
        return String.join("|",
                String.valueOf(entryId),
                actorDid == null ? "" : actorDid,
                action,
                targetDid == null ? "" : targetDid,
                targetType == null ? "" : targetType,
                details == null ? "" : details.toString(),
                String.valueOf(occurredAt.toEpochMilli()),
                previousHash == null ? "" : previousHash);
    }

    public Long getEntryId() {
        return entryId;
    }

    public String getActorDid() {
        return actorDid;
    }

    public String getAction() {
        return action;
    }

    public String getTargetDid() {
        return targetDid;
    }

    public String getTargetType() {
        return targetType;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public String getPreviousHash() {
        return previousHash;
    }
}
