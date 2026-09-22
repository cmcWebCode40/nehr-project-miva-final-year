package ng.nehr.backend.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.auth.dto.ChallengeRequest;
import ng.nehr.backend.auth.dto.ChallengeResponse;
import ng.nehr.backend.auth.dto.LogoutRequest;
import ng.nehr.backend.auth.dto.RefreshRequest;
import ng.nehr.backend.auth.dto.VerifyRequest;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Registration and login for all actor types, plus DID challenge-response")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/challenge")
    @Operation(summary = "Issue a one-time DID challenge nonce",
            description = "Self-custody patients only. Sign the returned nonce with your "
                    + "device-held Ed25519 private key and present it to /auth/verify.")
    public ChallengeResponse challenge(@Valid @RequestBody ChallengeRequest request) {
        return authService.issueChallenge(request);
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify a signed DID challenge and receive a token pair")
    public TokenPairResponse verify(@Valid @RequestBody VerifyRequest request) {
        return authService.verify(request);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a refresh token for a new token pair",
            description = "The presented refresh token is rotated (blacklisted) on use.")
    public TokenPairResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Blacklist an access/refresh token pair")
    public void logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
    }
}
