package ng.nehr.backend.credentials;

import ng.nehr.backend.account.doctor.DoctorAccount;
import ng.nehr.backend.account.doctor.DoctorAccountRepository;
import ng.nehr.backend.account.hospital.HospitalAccount;
import ng.nehr.backend.account.hospital.HospitalAccountRepository;
import ng.nehr.backend.account.hospital.HospitalKeyUnwrapService;
import ng.nehr.backend.audit.AuditAction;
import ng.nehr.backend.audit.AuditService;
import ng.nehr.backend.common.crypto.Blake3Hasher;
import ng.nehr.backend.common.crypto.Codecs;
import ng.nehr.backend.common.crypto.KeyPairService;
import ng.nehr.backend.common.crypto.XChaCha20Poly1305Cipher;
import ng.nehr.backend.common.web.ForbiddenException;
import ng.nehr.backend.common.web.NotFoundException;
import ng.nehr.backend.consent.ConsentService;
import ng.nehr.backend.credentials.dto.CredentialSummaryResponse;
import ng.nehr.backend.credentials.dto.IssueCredentialRequest;
import ng.nehr.backend.credentials.dto.IssueCredentialResponse;
import ng.nehr.backend.identity.DidRegistry;
import ng.nehr.backend.identity.DidRegistryService;
import ng.nehr.backend.identity.EntityType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CredentialIssuanceService {

    private final HospitalAccountRepository hospitalAccountRepository;
    private final DoctorAccountRepository doctorAccountRepository;
    private final HospitalKeyUnwrapService hospitalKeyUnwrapService;
    private final DidRegistryService didRegistryService;
    private final KeyPairService keyPairService;
    private final XChaCha20Poly1305Cipher cipher;
    private final Blake3Hasher blake3Hasher;
    private final VerifiableCredentialCodec codec;
    private final ConsentService consentService;
    private final EncryptedRecordRepository encryptedRecordRepository;
    private final RevokedCredentialRepository revokedCredentialRepository;
    private final AuditService auditService;

    public CredentialIssuanceService(HospitalAccountRepository hospitalAccountRepository,
                                      DoctorAccountRepository doctorAccountRepository,
                                      HospitalKeyUnwrapService hospitalKeyUnwrapService,
                                      DidRegistryService didRegistryService,
                                      KeyPairService keyPairService,
                                      XChaCha20Poly1305Cipher cipher,
                                      Blake3Hasher blake3Hasher,
                                      VerifiableCredentialCodec codec,
                                      ConsentService consentService,
                                      EncryptedRecordRepository encryptedRecordRepository,
                                      RevokedCredentialRepository revokedCredentialRepository,
                                      AuditService auditService) {
        this.hospitalAccountRepository = hospitalAccountRepository;
        this.doctorAccountRepository = doctorAccountRepository;
        this.hospitalKeyUnwrapService = hospitalKeyUnwrapService;
        this.didRegistryService = didRegistryService;
        this.keyPairService = keyPairService;
        this.cipher = cipher;
        this.blake3Hasher = blake3Hasher;
        this.codec = codec;
        this.consentService = consentService;
        this.encryptedRecordRepository = encryptedRecordRepository;
        this.revokedCredentialRepository = revokedCredentialRepository;
        this.auditService = auditService;
    }

    @Transactional
    public IssueCredentialResponse issue(String hospitalDid, String doctorDid, String patientDid,
                                          IssueCredentialRequest request) {
        consentService.requireActiveConsent(hospitalDid, patientDid, request.resourceType());

        HospitalAccount hospital = hospitalAccountRepository.findById(hospitalDid)
                .orElseThrow(() -> new NotFoundException("Hospital not found: " + hospitalDid));
        DoctorAccount doctor = doctorAccountRepository.findById(doctorDid)
                .orElseThrow(() -> new NotFoundException("Doctor not found: " + doctorDid));

        DidRegistry patientDidRecord = didRegistryService.getActiveOrThrow(patientDid);
        if (patientDidRecord.getEntityType() != EntityType.PATIENT) {
            throw new ForbiddenException("Credentials can only be issued to a patient DID");
        }

        byte[] dek = hospitalKeyUnwrapService.unwrapDek(hospitalDid, doctorDid, request.doctorPassword());
        byte[] hospitalSigningKey = hospitalKeyUnwrapService.unwrapSigningKey(hospital, dek);
        byte[] hospitalEncryptionKey = hospitalKeyUnwrapService.unwrapEncryptionKey(hospital, dek);

        Map<String, Object> vc = codec.build(
                hospitalDid, patientDid, request.resourceType(), request.content(),
                doctorDid, doctor.getFullName(), doctor.getLicenceNumber(), hospitalSigningKey);

        byte[] patientX25519Pub = Codecs.multibaseDecode(patientDidRecord.getPublicKeyX25());
        byte[] sharedSecret = keyPairService.agreeX25519(hospitalEncryptionKey, patientX25519Pub);
        byte[] symmetricKey = blake3Hasher.hash256(sharedSecret);
        byte[] nonce = cipher.generateNonce();
        byte[] ciphertext = cipher.encrypt(symmetricKey, nonce, null, codec.serialize(vc));

        String recordId = UUID.randomUUID().toString();
        encryptedRecordRepository.save(
                new EncryptedRecord(recordId, patientDid, hospitalDid, RecordType.VC, ciphertext, null, nonce));

        auditService.record(doctorDid, AuditAction.CREDENTIAL_ISSUED, patientDid, "PATIENT",
                Map.of("hospitalDid", hospitalDid, "recordId", recordId, "resourceType", request.resourceType()));
        return new IssueCredentialResponse(recordId, hospitalDid, patientDid, Instant.now());
    }

    @Transactional(readOnly = true)
    public List<CredentialSummaryResponse> listForHospital(String hospitalDid) {
        return encryptedRecordRepository.findByIssuerDidAndRecordTypeOrderByCreatedAtDesc(hospitalDid, RecordType.VC)
                .stream()
                .map(record -> new CredentialSummaryResponse(
                        record.getRecordId(),
                        record.getOwnerDid(),
                        record.getCreatedAt(),
                        revokedCredentialRepository.existsById(record.getRecordId())))
                .toList();
    }

    @Transactional
    public void revoke(String hospitalDid, String doctorDid, String recordId, String reason) {
        EncryptedRecord record = encryptedRecordRepository.findById(recordId)
                .orElseThrow(() -> new NotFoundException("Credential not found: " + recordId));
        if (!hospitalDid.equals(record.getIssuerDid())) {
            throw new ForbiddenException("Only the issuing hospital can revoke this credential");
        }
        if (revokedCredentialRepository.existsById(recordId)) {
            return;
        }
        revokedCredentialRepository.save(new RevokedCredential(recordId, doctorDid, reason));
        auditService.record(doctorDid, AuditAction.CREDENTIAL_REVOKED, record.getOwnerDid(), "PATIENT",
                Map.of("hospitalDid", hospitalDid, "recordId", recordId));
    }
}
