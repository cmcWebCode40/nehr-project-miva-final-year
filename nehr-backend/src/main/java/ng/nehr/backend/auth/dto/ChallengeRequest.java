package ng.nehr.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ChallengeRequest(@NotBlank String did) {
}
