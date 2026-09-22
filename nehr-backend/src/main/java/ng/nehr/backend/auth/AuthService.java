package ng.nehr.backend.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import ng.nehr.backend.account.doctor.DoctorAccount;
import ng.nehr.backend.account.doctor.DoctorAccountRepository;
import ng.nehr.backend.account.doctor.DoctorStatus;
import ng.nehr.backend.account.patient.CustodyType;
import ng.nehr.backend.account.patient.PatientAccountRepository;
import ng.nehr.backend.audit.AuditAction;
import ng.nehr.backend.audit.AuditService;
import ng.nehr.backend.auth.dto.ChallengeRequest;
import ng.nehr.backend.auth.dto.ChallengeResponse;
import ng.nehr.backend.auth.dto.LogoutRequest;
import ng.nehr.backend.auth.dto.RefreshRequest;
import ng.nehr.backend.auth.dto.VerifyRequest;
import ng.nehr.backend.common.crypto.Codecs;
import ng.nehr.backend.common.crypto.KeyPairService;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.common.security.ActorType;
import ng.nehr.backend.common.security.JwtService;
import ng.nehr.backend.common.security.RateLimiterService;
import ng.nehr.backend.common.security.TokenBlacklistService;
import ng.nehr.backend.common.security.TooManyRequestsException;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import ng.nehr.backend.common.web.ForbiddenException;
import ng.nehr.backend.common.web.UnauthorizedException;
import ng.nehr.backend.identity.DidRegistry;
import ng.nehr.backend.identity.DidRegistryService;
import ng.nehr.backend.identity.EntityType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;

@Service
public class AuthService {

    private final DidRegistryService didRegistryService;
    private final ChallengeService challengeService;
    private final KeyPairService keyPairService;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final PatientAccountRepository patientAccountRepository;
    private final DoctorAccountRepository doctorAccountRepository;
    private final RateLimiterService rateLimiterService;
    private final AuditService auditService;

    public AuthService(DidRegistryService didRegistryService,
                        ChallengeService challengeService,
                        KeyPairService keyPairService,
                        JwtService jwtService,
                        TokenBlacklistService tokenBlacklistService,
                        PatientAccountRepository patientAccountRepository,
                        DoctorAccountRepository doctorAccountRepository,
                        RateLimiterService rateLimiterService,
                        AuditService auditService) {
        this.didRegistryService = didRegistryService;
        this.challengeService = challengeService;
        this.keyPairService = keyPairService;
        this.jwtService = jwtService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.patientAccountRepository = patientAccountRepository;
        this.doctorAccountRepository = doctorAccountRepository;
        this.rateLimiterService = rateLimiterService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public ChallengeResponse issueChallenge(ChallengeRequest request) {
        if (!rateLimiterService.tryConsume("challenge:" + request.did())) {
            throw new TooManyRequestsException();
        }
        requireSelfCustodyPatient(request.did());

        ChallengeService.IssuedChallenge issued = challengeService.issueChallenge(request.did());
        return new ChallengeResponse(issued.nonce(), issued.expiresAt());
    }

    @Transactional(readOnly = true)
    public TokenPairResponse verify(VerifyRequest request) {
        if (!rateLimiterService.tryConsume("verify:" + request.did())) {
            throw new TooManyRequestsException();
        }
        if (!challengeService.consumeIfValid(request.did(), request.nonce())) {
            throw new UnauthorizedException("Invalid or expired challenge");
        }

        DidRegistry didRecord = requireSelfCustodyPatient(request.did());
        byte[] publicKey = Codecs.multibaseDecode(didRecord.getPublicKeyEd());
        byte[] signature = Base64.getDecoder().decode(request.signature());
        byte[] nonceBytes = Base64.getUrlDecoder().decode(request.nonce());

        if (!keyPairService.verify(publicKey, nonceBytes, signature)) {
            throw new UnauthorizedException("Signature verification failed");
        }
        auditService.record(request.did(), AuditAction.LOGIN_SUCCESS, null, "PATIENT", null);
        return jwtService.issueTokenPair(ActorPrincipal.patient(request.did()));
    }

    @Transactional(readOnly = true)
    public TokenPairResponse refresh(RefreshRequest request) {
        Claims claims = parseOrThrow(request.refreshToken());
        if (!jwtService.isRefreshToken(claims)) {
            throw new UnauthorizedException("Not a refresh token");
        }
        if (tokenBlacklistService.isBlacklisted(claims.getId())) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        ActorPrincipal principal = jwtService.toPrincipal(claims);
        if (principal.actorType() == ActorType.DOCTOR) {
            requireStillActiveDoctor(principal);
        }

        tokenBlacklistService.blacklist(claims.getId(), claims.getExpiration().toInstant());
        return jwtService.issueTokenPair(principal);
    }

    public void logout(LogoutRequest request) {
        blacklistIfParseable(request.accessToken());
        blacklistIfParseable(request.refreshToken());
    }

    private DidRegistry requireSelfCustodyPatient(String did) {
        DidRegistry didRecord = didRegistryService.getActiveOrThrow(did);
        if (didRecord.getEntityType() != EntityType.PATIENT) {
            throw new ForbiddenException("DID challenge-response is only available to patients");
        }
        patientAccountRepository.findById(did)
                .filter(account -> account.getCustodyType() == CustodyType.SELF)
                .orElseThrow(() -> new ForbiddenException("DID is not registered as a self-custody patient"));
        return didRecord;
    }

    private void requireStillActiveDoctor(ActorPrincipal principal) {
        DoctorAccount doctor = doctorAccountRepository.findById(principal.subject())
                .orElseThrow(() -> new UnauthorizedException("Doctor account no longer exists"));
        boolean tokenVersionMatches = principal.tokenVersion() != null
                && principal.tokenVersion() == doctor.getTokenVersion();
        if (doctor.getStatus() != DoctorStatus.ACTIVE || !tokenVersionMatches) {
            throw new UnauthorizedException("Doctor account is no longer active");
        }
    }

    private Claims parseOrThrow(String token) {
        try {
            return jwtService.parse(token).getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid token");
        }
    }

    private void blacklistIfParseable(String token) {
        try {
            Claims claims = jwtService.parse(token).getPayload();
            tokenBlacklistService.blacklist(claims.getId(), claims.getExpiration().toInstant());
        } catch (JwtException | IllegalArgumentException ignored) {
            // already invalid or expired - nothing to blacklist
        }
    }
}
