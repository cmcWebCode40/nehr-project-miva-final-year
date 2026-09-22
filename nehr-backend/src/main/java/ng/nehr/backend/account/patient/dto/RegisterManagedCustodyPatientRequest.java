package ng.nehr.backend.account.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Managed-custody registration: the app still generates the keypair and
 * encrypts the private keys locally (Argon2id-derived from the patient's
 * password) before sending them here - the server only ever stores and
 * returns this ciphertext, it never derives Argon2id or sees a plaintext
 * private key. {@code password} is separate from that client-side
 * encryption key: it is bcrypt-hashed here purely for login verification.
 */
public record RegisterManagedCustodyPatientRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password,
        @NotBlank String ed25519PublicKey,
        @NotBlank String x25519PublicKey,
        @NotBlank String encryptedPrivateKeyEd,
        @NotBlank String encryptedPrivateKeyX25) {
}
