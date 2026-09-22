package ng.nehr.backend.account.hospital.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * The hospital's institutional Ed25519/X25519 keypair is generated
 * client-side in the hospital web app, same as patients. Unlike patients,
 * the raw private keys are submitted here once at registration - the
 * server needs to be able to use them later to sign VCs on the hospital's
 * behalf, so it wraps them under a generated DEK rather than leaving them
 * purely client-held.
 */
public record RegisterHospitalRequest(
        @NotBlank String hospitalName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password,
        @NotBlank String ed25519PublicKey,
        @NotBlank String x25519PublicKey,
        @NotBlank String ed25519PrivateKey,
        @NotBlank String x25519PrivateKey) {
}
