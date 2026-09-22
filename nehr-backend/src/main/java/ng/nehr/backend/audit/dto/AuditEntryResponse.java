package ng.nehr.backend.audit.dto;

import ng.nehr.backend.audit.AuditTrail;

import java.time.Instant;
import java.util.Map;

public record AuditEntryResponse(
        Long entryId,
        String actorDid,
        String action,
        String targetDid,
        String targetType,
        Map<String, Object> details,
        Instant occurredAt) {

    public static AuditEntryResponse from(AuditTrail entry) {
        return new AuditEntryResponse(
                entry.getEntryId(),
                entry.getActorDid(),
                entry.getAction(),
                entry.getTargetDid(),
                entry.getTargetType(),
                entry.getDetails(),
                entry.getOccurredAt());
    }
}
