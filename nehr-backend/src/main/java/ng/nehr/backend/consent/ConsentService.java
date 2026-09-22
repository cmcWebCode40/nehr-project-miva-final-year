package ng.nehr.backend.consent;

import ng.nehr.backend.audit.AuditAction;
import ng.nehr.backend.audit.AuditService;
import ng.nehr.backend.common.crypto.Codecs;
import ng.nehr.backend.common.crypto.KeyPairService;
import ng.nehr.backend.common.web.ForbiddenException;
import ng.nehr.backend.common.web.NotFoundException;
import ng.nehr.backend.common.web.UnauthorizedException;
import ng.nehr.backend.consent.dto.ConsentResponse;
import ng.nehr.backend.consent.dto.RequestConsentRequest;
import ng.nehr.backend.identity.DidRegistry;
import ng.nehr.backend.identity.DidRegistryService;
import ng.nehr.backend.identity.EntityType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ConsentService {

    private final ConsentRecordRepository repository;
    private final DidRegistryService didRegistryService;
    private final KeyPairService keyPairService;
    private final AuditService auditService;

    public ConsentService(ConsentRecordRepository repository, DidRegistryService didRegistryService,
                           KeyPairService keyPairService, AuditService auditService) {
        this.repository = repository;
        this.didRegistryService = didRegistryService;
        this.keyPairService = keyPairService;
        this.auditService = auditService;
    }

    @Transactional
    public ConsentResponse requestConsent(String hospitalDid, String doctorDid, RequestConsentRequest request) {
        DidRegistry patientDidRecord = didRegistryService.getActiveOrThrow(request.patientDid());
        if (patientDidRecord.getEntityType() != EntityType.PATIENT) {
            throw new ForbiddenException("Consent can only be requested from a patient DID");
        }

        Instant now = Instant.now();
        Instant validUntil = request.validityDays() != null ? now.plusSeconds(request.validityDays() * 86400L) : null;

        ConsentRecord record = new ConsentRecord(
                UUID.randomUUID().toString(),
                request.patientDid(),
                hospitalDid,
                doctorDid,
                request.scope(),
                request.purpose(),
                now,
                validUntil);
        repository.save(record);

        auditService.record(doctorDid, AuditAction.CONSENT_REQUESTED, request.patientDid(), "PATIENT",
                Map.of("hospitalDid", hospitalDid, "consentId", record.getConsentId()));
        return ConsentResponse.from(record);
    }

    @Transactional(readOnly = true)
    public List<ConsentResponse> listForPatient(String patientDid) {
        return repository.findByGrantorDid(patientDid).stream().map(ConsentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ConsentResponse> listForHospital(String hospitalDid) {
        return repository.findByGranteeDid(hospitalDid).stream().map(ConsentResponse::from).toList();
    }

    @Transactional
    public ConsentResponse accept(String patientDid, String consentId, String signatureBase64) {
        ConsentRecord record = repository.findByConsentIdAndGrantorDid(consentId, patientDid)
                .orElseThrow(() -> new NotFoundException("Consent request not found: " + consentId));
        if (record.getStatus() != ConsentStatus.PENDING) {
            throw new ForbiddenException("Consent request is not pending");
        }

        DidRegistry patientDidRecord = didRegistryService.getActiveOrThrow(patientDid);
        byte[] publicKey = Codecs.multibaseDecode(patientDidRecord.getPublicKeyEd());
        byte[] signature = Base64.getDecoder().decode(signatureBase64);
        byte[] payload = record.canonicalSigningPayload().getBytes(StandardCharsets.UTF_8);

        if (!keyPairService.verify(publicKey, payload, signature)) {
            throw new UnauthorizedException("Consent signature verification failed");
        }

        record.grant(signatureBase64);
        auditService.record(patientDid, AuditAction.CONSENT_GRANTED, record.getGranteeDid(), "HOSPITAL",
                Map.of("consentId", consentId));
        return ConsentResponse.from(record);
    }

    @Transactional
    public ConsentResponse revoke(String patientDid, String consentId) {
        ConsentRecord record = repository.findByConsentIdAndGrantorDid(consentId, patientDid)
                .orElseThrow(() -> new NotFoundException("Consent request not found: " + consentId));
        record.revoke();
        auditService.record(patientDid, AuditAction.CONSENT_REVOKED, record.getGranteeDid(), "HOSPITAL",
                Map.of("consentId", consentId));
        return ConsentResponse.from(record);
    }

    @Transactional(readOnly = true)
    public void requireActiveConsent(String hospitalDid, String patientDid, String resourceType) {
        boolean hasActiveConsent = repository
                .findByGrantorDidAndGranteeDidAndStatus(patientDid, hospitalDid, ConsentStatus.GRANTED)
                .stream()
                .anyMatch(record -> record.isActiveFor(resourceType));
        if (!hasActiveConsent) {
            throw new ForbiddenException(
                    "No active consent from " + patientDid + " covering resource type " + resourceType);
        }
    }
}
