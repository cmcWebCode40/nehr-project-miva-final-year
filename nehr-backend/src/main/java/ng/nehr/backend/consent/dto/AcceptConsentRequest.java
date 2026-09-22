package ng.nehr.backend.consent.dto;

import jakarta.validation.constraints.NotBlank;

/** {@code signature} is the patient's Ed25519 signature (base64), signed client-side over the consent's canonicalSigningPayload. */
public record AcceptConsentRequest(@NotBlank String signature) {
}
