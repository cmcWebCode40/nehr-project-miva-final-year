package ng.nehr.backend.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import ng.nehr.backend.common.config.NehrProperties;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private static final String CLAIM_ACTOR_TYPE = "actor_type";
    private static final String CLAIM_HOSPITAL_DID = "hospital_did";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_DEPARTMENT = "department";
    private static final String CLAIM_TOKEN_VERSION = "token_version";
    private static final String CLAIM_TOKEN_TYPE = "token_type";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    private final SecretKey signingKey;
    private final Duration accessTokenTtl;
    private final Duration refreshTokenTtl;

    public JwtService(NehrProperties properties) {
        String secret = properties.jwt().secret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("nehr.jwt.secret must be configured");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenTtl = Duration.ofMinutes(properties.jwt().accessTokenTtlMinutes());
        this.refreshTokenTtl = Duration.ofDays(properties.jwt().refreshTokenTtlDays());
    }

    public IssuedToken issueAccessToken(ActorPrincipal principal) {
        return issue(principal, TOKEN_TYPE_ACCESS, accessTokenTtl);
    }

    public IssuedToken issueRefreshToken(ActorPrincipal principal) {
        return issue(principal, TOKEN_TYPE_REFRESH, refreshTokenTtl);
    }

    public TokenPairResponse issueTokenPair(ActorPrincipal principal) {
        IssuedToken access = issueAccessToken(principal);
        IssuedToken refresh = issueRefreshToken(principal);
        return new TokenPairResponse(access.token(), refresh.token(), access.expiresAt(), refresh.expiresAt());
    }

    private IssuedToken issue(ActorPrincipal principal, String tokenType, Duration ttl) {
        Instant now = Instant.now();
        Instant expiry = now.plus(ttl);
        String jti = UUID.randomUUID().toString();

        JwtBuilder builder = Jwts.builder()
                .subject(principal.subject())
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim(CLAIM_ACTOR_TYPE, principal.actorType().name())
                .claim(CLAIM_TOKEN_TYPE, tokenType);

        if (principal.hospitalDid() != null) {
            builder.claim(CLAIM_HOSPITAL_DID, principal.hospitalDid());
        }
        if (principal.role() != null) {
            builder.claim(CLAIM_ROLE, principal.role());
        }
        if (principal.department() != null) {
            builder.claim(CLAIM_DEPARTMENT, principal.department());
        }
        if (principal.tokenVersion() != null) {
            builder.claim(CLAIM_TOKEN_VERSION, principal.tokenVersion());
        }

        String token = builder.signWith(signingKey).compact();
        return new IssuedToken(token, jti, expiry);
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token);
    }

    public ActorPrincipal toPrincipal(Claims claims) {
        Integer tokenVersion = claims.get(CLAIM_TOKEN_VERSION, Integer.class);
        return new ActorPrincipal(
                claims.getSubject(),
                ActorType.valueOf(claims.get(CLAIM_ACTOR_TYPE, String.class)),
                claims.get(CLAIM_HOSPITAL_DID, String.class),
                claims.get(CLAIM_ROLE, String.class),
                claims.get(CLAIM_DEPARTMENT, String.class),
                tokenVersion);
    }

    public boolean isRefreshToken(Claims claims) {
        return TOKEN_TYPE_REFRESH.equals(claims.get(CLAIM_TOKEN_TYPE, String.class));
    }

    public record IssuedToken(String token, String jti, Instant expiresAt) {
    }
}
