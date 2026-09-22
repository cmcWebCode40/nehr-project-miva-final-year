package ng.nehr.backend.account.patient;

import ng.nehr.backend.account.patient.dto.PatientLoginRequest;
import ng.nehr.backend.account.patient.dto.PatientLoginResponse;
import ng.nehr.backend.account.patient.dto.PatientRegistrationResponse;
import ng.nehr.backend.account.patient.dto.RegisterManagedCustodyPatientRequest;
import ng.nehr.backend.account.patient.dto.RegisterSelfCustodyPatientRequest;
import ng.nehr.backend.audit.AuditAction;
import ng.nehr.backend.audit.AuditService;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.common.security.JwtService;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import ng.nehr.backend.common.web.ConflictException;
import ng.nehr.backend.common.web.UnauthorizedException;
import ng.nehr.backend.identity.DidRegistry;
import ng.nehr.backend.identity.DidRegistryService;
import ng.nehr.backend.identity.EntityType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;

@Service
public class PatientAuthService {

    private final PatientAccountRepository repository;
    private final DidRegistryService didRegistryService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    public PatientAuthService(PatientAccountRepository repository,
                               DidRegistryService didRegistryService,
                               PasswordEncoder passwordEncoder,
                               JwtService jwtService,
                               AuditService auditService) {
        this.repository = repository;
        this.didRegistryService = didRegistryService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @Transactional
    public PatientRegistrationResponse registerSelfCustody(RegisterSelfCustodyPatientRequest request) {
        DidRegistry didRecord = didRegistryService.register(
                EntityType.PATIENT, decode(request.ed25519PublicKey()), decode(request.x25519PublicKey()));
        repository.save(PatientAccount.selfCustody(didRecord.getDid()));
        return new PatientRegistrationResponse(didRecord.getDid(), CustodyType.SELF);
    }

    @Transactional
    public PatientRegistrationResponse registerManagedCustody(RegisterManagedCustodyPatientRequest request) {
        if (repository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered: " + request.email());
        }

        DidRegistry didRecord = didRegistryService.register(
                EntityType.PATIENT, decode(request.ed25519PublicKey()), decode(request.x25519PublicKey()));

        PatientAccount account = PatientAccount.managedCustody(
                didRecord.getDid(),
                request.email(),
                passwordEncoder.encode(request.password()),
                decode(request.encryptedPrivateKeyEd()),
                decode(request.encryptedPrivateKeyX25()));
        repository.save(account);
        return new PatientRegistrationResponse(didRecord.getDid(), CustodyType.MANAGED);
    }

    @Transactional(readOnly = true)
    public PatientLoginResponse login(PatientLoginRequest request) {
        PatientAccount account = repository.findByEmail(request.email())
                .filter(a -> a.getCustodyType() == CustodyType.MANAGED)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        auditService.record(account.getDid(), AuditAction.LOGIN_SUCCESS, null, "PATIENT", null);
        TokenPairResponse tokens = jwtService.issueTokenPair(ActorPrincipal.patient(account.getDid()));
        return new PatientLoginResponse(
                tokens,
                encode(account.getEncryptedPrivEd()),
                encode(account.getEncryptedPrivX25()));
    }

    private static byte[] decode(String base64) {
        return Base64.getDecoder().decode(base64);
    }

    private static String encode(byte[] bytes) {
        return Base64.getEncoder().encodeToString(bytes);
    }
}
