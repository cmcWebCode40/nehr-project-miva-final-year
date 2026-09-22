package ng.nehr.backend.account.hospital;

import ng.nehr.backend.account.hospital.dto.HospitalLoginRequest;
import ng.nehr.backend.account.hospital.dto.HospitalRegistrationResponse;
import ng.nehr.backend.account.hospital.dto.RegisterHospitalRequest;
import ng.nehr.backend.audit.AuditAction;
import ng.nehr.backend.audit.AuditService;
import ng.nehr.backend.common.crypto.EnvelopeCipher;
import ng.nehr.backend.common.crypto.XChaCha20Poly1305Cipher;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.common.security.JwtService;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import ng.nehr.backend.common.web.ConflictException;
import ng.nehr.backend.common.web.ForbiddenException;
import ng.nehr.backend.common.web.UnauthorizedException;
import ng.nehr.backend.identity.DidRegistry;
import ng.nehr.backend.identity.DidRegistryService;
import ng.nehr.backend.identity.EntityType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;

@Service
public class HospitalAuthService {

    private final HospitalAccountRepository accountRepository;
    private final HospitalKeyGrantRepository keyGrantRepository;
    private final DidRegistryService didRegistryService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final XChaCha20Poly1305Cipher cipher;
    private final EnvelopeCipher envelopeCipher;
    private final AuditService auditService;

    public HospitalAuthService(HospitalAccountRepository accountRepository,
                                HospitalKeyGrantRepository keyGrantRepository,
                                DidRegistryService didRegistryService,
                                PasswordEncoder passwordEncoder,
                                JwtService jwtService,
                                XChaCha20Poly1305Cipher cipher,
                                EnvelopeCipher envelopeCipher,
                                AuditService auditService) {
        this.accountRepository = accountRepository;
        this.keyGrantRepository = keyGrantRepository;
        this.didRegistryService = didRegistryService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.cipher = cipher;
        this.envelopeCipher = envelopeCipher;
        this.auditService = auditService;
    }

    @Transactional
    public HospitalRegistrationResponse register(RegisterHospitalRequest request) {
        if (accountRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered: " + request.email());
        }

        DidRegistry didRecord = didRegistryService.register(
                EntityType.HOSPITAL, decode(request.ed25519PublicKey()), decode(request.x25519PublicKey()));
        String hospitalDid = didRecord.getDid();

        byte[] dek = cipher.generateKey();
        byte[] encryptedSignKey = envelopeCipher.sealWithKey(dek, decode(request.ed25519PrivateKey()));
        byte[] encryptedEncKey = envelopeCipher.sealWithKey(dek, decode(request.x25519PrivateKey()));

        HospitalAccount account = new HospitalAccount(
                hospitalDid,
                request.hospitalName(),
                request.email(),
                passwordEncoder.encode(request.password()),
                encryptedSignKey,
                encryptedEncKey);
        accountRepository.save(account);

        byte[] wrappedDek = envelopeCipher.sealWithPassword(request.password(), dek);
        keyGrantRepository.save(new HospitalKeyGrant(hospitalDid, hospitalDid, wrappedDek));

        auditService.record(hospitalDid, AuditAction.HOSPITAL_REGISTERED, null, "HOSPITAL", null);
        return new HospitalRegistrationResponse(hospitalDid, account.getStatus());
    }

    @Transactional(readOnly = true)
    public TokenPairResponse login(HospitalLoginRequest request) {
        HospitalAccount account = accountRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        switch (account.getStatus()) {
            case PENDING -> throw new ForbiddenException("Hospital registration is pending platform approval");
            case SUSPENDED -> throw new ForbiddenException("Hospital has been suspended");
            case APPROVED -> { /* proceed */ }
        }

        auditService.record(account.getHospitalDid(), AuditAction.LOGIN_SUCCESS, null, "HOSPITAL_ADMIN", null);
        return jwtService.issueTokenPair(ActorPrincipal.hospitalAdmin(account.getHospitalDid()));
    }

    private static byte[] decode(String base64) {
        return Base64.getDecoder().decode(base64);
    }
}
