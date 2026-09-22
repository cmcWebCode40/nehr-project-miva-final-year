package ng.nehr.backend.credentials.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record VerifyCredentialRequest(@NotNull Map<String, Object> credential) {
}
