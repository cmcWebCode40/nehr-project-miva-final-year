package ng.nehr.backend.credentials.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * content is a lightweight FHIR R4-shaped JSON object (e.g. a simplified
 * Observation/Condition/MedicationRequest/DiagnosticReport) - not yet
 * validated against the actual FHIR R4 structure definitions (see
 * TECH_DEBT.md). doctorPassword re-authenticates this sensitive action,
 * unwrapping the hospital's signing/encryption keys just long enough to
 * issue this one credential - it is never stored.
 */
public record IssueCredentialRequest(
        @NotBlank String resourceType,
        @NotNull @NotEmpty Map<String, Object> content,
        @NotBlank String doctorPassword) {
}
