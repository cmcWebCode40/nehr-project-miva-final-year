package ng.nehr.backend.account.patient.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Self-custody registration: keys are generated on-device and never leave
 * it. Only the public keys are ever sent to the server.
 */
public record RegisterSelfCustodyPatientRequest(
        @NotBlank String ed25519PublicKey,
        @NotBlank String x25519PublicKey) {
}
