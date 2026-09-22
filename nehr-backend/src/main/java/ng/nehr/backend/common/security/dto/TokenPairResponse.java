package ng.nehr.backend.common.security.dto;

import java.time.Instant;

public record TokenPairResponse(
        String accessToken,
        String refreshToken,
        Instant accessTokenExpiresAt,
        Instant refreshTokenExpiresAt) {
}
