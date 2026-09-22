package ng.nehr.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(@NotBlank String accessToken, @NotBlank String refreshToken) {
}
