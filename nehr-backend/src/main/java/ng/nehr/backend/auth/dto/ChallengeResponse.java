package ng.nehr.backend.auth.dto;

import java.time.Instant;

public record ChallengeResponse(String nonce, Instant expiresAt) {
}
