package ng.nehr.backend.account.platformadmin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.account.platformadmin.dto.PlatformAdminLoginRequest;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/platform-admins")
@Tag(name = "Auth", description = "Registration and login for all actor types, plus DID challenge-response")
public class PlatformAdminAuthController {

    private final PlatformAdminAuthService service;

    public PlatformAdminAuthController(PlatformAdminAuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    @Operation(summary = "Platform admin login (email + password)",
            description = "One admin account is seeded on first boot from nehr.platform-admin.* config.")
    public TokenPairResponse login(@Valid @RequestBody PlatformAdminLoginRequest request) {
        return service.login(request);
    }
}
