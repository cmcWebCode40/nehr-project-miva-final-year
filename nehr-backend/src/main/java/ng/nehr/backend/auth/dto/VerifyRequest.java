package ng.nehr.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyRequest(@NotBlank String did, @NotBlank String nonce, @NotBlank String signature) {
}
