package ng.nehr.backend.account.platformadmin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PlatformAdminLoginRequest(@NotBlank @Email String email, @NotBlank String password) {
}
