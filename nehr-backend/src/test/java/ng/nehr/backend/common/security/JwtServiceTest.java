package ng.nehr.backend.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.SignatureException;
import ng.nehr.backend.common.config.NehrProperties;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private final NehrProperties properties = new NehrProperties(
            new NehrProperties.Jwt("test-secret-key-at-least-32-bytes-long!!", 30, 7),
            new NehrProperties.Challenge(300),
            new NehrProperties.RateLimit(10),
            new NehrProperties.Did("nehr", "http://localhost:8080"),
            new NehrProperties.PlatformAdmin("admin@nehr.local", "test-password", "Test Admin"),
            new NehrProperties.Cors(java.util.List.of("http://localhost:3000")));

    private final JwtService jwtService = new JwtService(properties);

    @Test
    void issuedAccessTokenRoundTripsToOriginalPrincipal() {
        ActorPrincipal original = ActorPrincipal.doctor("did:nehr:doc1", "did:nehr:hosp1", "PHYSICIAN", "CARDIOLOGY", 2);

        JwtService.IssuedToken issued = jwtService.issueAccessToken(original);
        Claims claims = jwtService.parse(issued.token()).getPayload();
        ActorPrincipal parsed = jwtService.toPrincipal(claims);

        assertThat(parsed).isEqualTo(original);
        assertThat(jwtService.isRefreshToken(claims)).isFalse();
    }

    @Test
    void issuedRefreshTokenIsFlaggedAsRefresh() {
        ActorPrincipal principal = ActorPrincipal.patient("did:nehr:patient1");
        JwtService.IssuedToken issued = jwtService.issueRefreshToken(principal);

        Claims claims = jwtService.parse(issued.token()).getPayload();

        assertThat(jwtService.isRefreshToken(claims)).isTrue();
    }

    @Test
    void eachIssuedTokenHasAUniqueJti() {
        ActorPrincipal principal = ActorPrincipal.platformAdmin("admin-1");
        JwtService.IssuedToken first = jwtService.issueAccessToken(principal);
        JwtService.IssuedToken second = jwtService.issueAccessToken(principal);

        assertThat(first.jti()).isNotEqualTo(second.jti());
    }

    @Test
    void tokenSignedWithDifferentSecretFailsToParse() {
        NehrProperties otherProperties = new NehrProperties(
                new NehrProperties.Jwt("a-completely-different-secret-key-32bytes!", 30, 7),
                properties.challenge(), properties.rateLimit(), properties.did(), properties.platformAdmin(),
                properties.cors());
        JwtService otherJwtService = new JwtService(otherProperties);
        String token = jwtService.issueAccessToken(ActorPrincipal.patient("did:nehr:x")).token();

        assertThatThrownBy(() -> otherJwtService.parse(token)).isInstanceOf(SignatureException.class);
    }

    @Test
    void hospitalAdminPrincipalCarriesHospitalDidAsBothSubjectAndClaim() {
        ActorPrincipal principal = ActorPrincipal.hospitalAdmin("did:nehr:hospital-x");
        Claims claims = jwtService.parse(jwtService.issueAccessToken(principal).token()).getPayload();

        ActorPrincipal parsed = jwtService.toPrincipal(claims);

        assertThat(parsed.subject()).isEqualTo("did:nehr:hospital-x");
        assertThat(parsed.hospitalDid()).isEqualTo("did:nehr:hospital-x");
    }
}
