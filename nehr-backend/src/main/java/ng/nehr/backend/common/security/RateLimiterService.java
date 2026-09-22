package ng.nehr.backend.common.security;

import ng.nehr.backend.common.config.NehrProperties;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/** Basic fixed-window rate limiter for login/challenge endpoints (per ch.3.4 - nothing more elaborate). */
@Service
public class RateLimiterService {

    private static final String KEY_PREFIX = "ratelimit:";

    private final StringRedisTemplate redisTemplate;
    private final int limitPerMinute;

    public RateLimiterService(StringRedisTemplate redisTemplate, NehrProperties properties) {
        this.redisTemplate = redisTemplate;
        this.limitPerMinute = properties.rateLimit().loginAttemptsPerMinute();
    }

    public boolean tryConsume(String bucketKey) {
        String key = KEY_PREFIX + bucketKey;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }
        return count == null || count <= limitPerMinute;
    }
}
