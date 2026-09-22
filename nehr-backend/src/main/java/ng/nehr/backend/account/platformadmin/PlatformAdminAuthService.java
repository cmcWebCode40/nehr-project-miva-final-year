package ng.nehr.backend.account.platformadmin;

import ng.nehr.backend.account.platformadmin.dto.PlatformAdminLoginRequest;
import ng.nehr.backend.audit.AuditAction;
import ng.nehr.backend.audit.AuditService;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.common.security.JwtService;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import ng.nehr.backend.common.web.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformAdminAuthService {

    private final PlatformAdminRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    public PlatformAdminAuthService(PlatformAdminRepository repository, PasswordEncoder passwordEncoder,
                                     JwtService jwtService, AuditService auditService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public TokenPairResponse login(PlatformAdminLoginRequest request) {
        PlatformAdmin admin = repository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String adminId = String.valueOf(admin.getId());
        auditService.record(adminId, AuditAction.LOGIN_SUCCESS, null, "PLATFORM_ADMIN", null);
        return jwtService.issueTokenPair(ActorPrincipal.platformAdmin(adminId));
    }
}
