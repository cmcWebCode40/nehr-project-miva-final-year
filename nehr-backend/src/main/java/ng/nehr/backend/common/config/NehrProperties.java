package ng.nehr.backend.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "nehr")
public record NehrProperties(
        Jwt jwt, Challenge challenge, RateLimit rateLimit, Did did, PlatformAdmin platformAdmin, Cors cors) {

    public record Jwt(String secret, long accessTokenTtlMinutes, long refreshTokenTtlDays) {
    }

    public record Challenge(long ttlSeconds) {
    }

    public record RateLimit(int loginAttemptsPerMinute) {
    }

    public record Did(String method, String baseUrl) {
    }

    /** Seed values for the one platform admin account created on first boot. */
    public record PlatformAdmin(String email, String defaultPassword, String name) {
    }

    /** Origins the browser-facing web portal(s) are served from. */
    public record Cors(List<String> allowedOrigins) {
    }
}
