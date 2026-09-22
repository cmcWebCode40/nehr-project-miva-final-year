package ng.nehr.backend.account.doctor;

import ng.nehr.backend.account.doctor.dto.DoctorLoginRequest;
import ng.nehr.backend.audit.AuditAction;
import ng.nehr.backend.audit.AuditService;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.common.security.JwtService;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import ng.nehr.backend.common.web.ForbiddenException;
import ng.nehr.backend.common.web.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DoctorAuthService {

    private final DoctorAccountRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    public DoctorAuthService(DoctorAccountRepository repository, PasswordEncoder passwordEncoder,
                              JwtService jwtService, AuditService auditService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public TokenPairResponse login(DoctorLoginRequest request) {
        DoctorAccount doctor = repository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), doctor.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        switch (doctor.getStatus()) {
            case SUSPENDED -> throw new ForbiddenException("Doctor account is suspended");
            case REMOVED -> throw new ForbiddenException("Doctor account has been removed");
            case ACTIVE -> { /* proceed */ }
        }

        auditService.record(doctor.getDoctorDid(), AuditAction.LOGIN_SUCCESS, null, "DOCTOR", null);
        ActorPrincipal principal = ActorPrincipal.doctor(
                doctor.getDoctorDid(), doctor.getHospitalDid(), doctor.getRole(),
                doctor.getDepartment(), doctor.getTokenVersion());
        return jwtService.issueTokenPair(principal);
    }
}
