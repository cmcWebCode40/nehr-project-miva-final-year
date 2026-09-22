package ng.nehr.backend.auth;

import ng.nehr.backend.common.config.NehrProperties;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/** One-time DID challenge nonces for the self-custody login flow, backed by Redis with a TTL. */
@Service
public class ChallengeService {

    private static final String KEY_PREFIX = "auth:challenge:";
    private static final int NONCE_BYTES = 32;

    private final StringRedisTemplate redisTemplate;
    private final Duration ttl;
    private final SecureRandom random = new SecureRandom();

    public ChallengeService(StringRedisTemplate redisTemplate, NehrProperties properties) {
        this.redisTemplate = redisTemplate;
        this.ttl = Duration.ofSeconds(properties.challenge().ttlSeconds());
    }

    public IssuedChallenge issueChallenge(String did) {
        byte[] nonceBytes = new byte[NONCE_BYTES];
        random.nextBytes(nonceBytes);
        String nonce = Base64.getUrlEncoder().withoutPadding().encodeToString(nonceBytes);
        redisTemplate.opsForValue().set(KEY_PREFIX + did, nonce, ttl);
        return new IssuedChallenge(nonce, Instant.now().plus(ttl));
    }

    /** Single-use: a matching nonce is deleted whether or not the caller later verifies the signature. */
    public boolean consumeIfValid(String did, String presentedNonce) {
        String key = KEY_PREFIX + did;
        String stored = redisTemplate.opsForValue().get(key);
        if (stored == null || !stored.equals(presentedNonce)) {
            return false;
        }
        redisTemplate.delete(key);
        return true;
    }

    public record IssuedChallenge(String nonce, Instant expiresAt) {
    }
}
