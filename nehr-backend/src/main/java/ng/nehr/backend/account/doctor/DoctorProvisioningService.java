package ng.nehr.backend.account.doctor;

import ng.nehr.backend.account.doctor.dto.CreateDoctorRequest;
import ng.nehr.backend.account.doctor.dto.DoctorSummaryResponse;
import ng.nehr.backend.account.hospital.HospitalAccount;
import ng.nehr.backend.account.hospital.HospitalAccountRepository;
import ng.nehr.backend.account.hospital.HospitalKeyGrant;
import ng.nehr.backend.account.hospital.HospitalKeyGrantRepository;
import ng.nehr.backend.account.hospital.HospitalKeyUnwrapService;
import ng.nehr.backend.audit.AuditAction;
import ng.nehr.backend.audit.AuditService;
import ng.nehr.backend.common.crypto.EnvelopeCipher;
import ng.nehr.backend.common.crypto.KeyPairService;
import ng.nehr.backend.common.crypto.RawKeyPair;
import ng.nehr.backend.common.web.ConflictException;
import ng.nehr.backend.common.web.NotFoundException;
import ng.nehr.backend.identity.DidRegistry;
import ng.nehr.backend.identity.DidRegistryService;
import ng.nehr.backend.identity.EntityType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorProvisioningService {

    private final DoctorAccountRepository doctorAccountRepository;
    private final HospitalAccountRepository hospitalAccountRepository;
    private final HospitalKeyGrantRepository hospitalKeyGrantRepository;
    private final HospitalKeyUnwrapService hospitalKeyUnwrapService;
    private final DidRegistryService didRegistryService;
    private final KeyPairService keyPairService;
    private final EnvelopeCipher envelopeCipher;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public DoctorProvisioningService(DoctorAccountRepository doctorAccountRepository,
                                      HospitalAccountRepository hospitalAccountRepository,
                                      HospitalKeyGrantRepository hospitalKeyGrantRepository,
                                      HospitalKeyUnwrapService hospitalKeyUnwrapService,
                                      DidRegistryService didRegistryService,
                                      KeyPairService keyPairService,
                                      EnvelopeCipher envelopeCipher,
                                      PasswordEncoder passwordEncoder,
                                      AuditService auditService) {
        this.doctorAccountRepository = doctorAccountRepository;
        this.hospitalAccountRepository = hospitalAccountRepository;
        this.hospitalKeyGrantRepository = hospitalKeyGrantRepository;
        this.hospitalKeyUnwrapService = hospitalKeyUnwrapService;
        this.didRegistryService = didRegistryService;
        this.keyPairService = keyPairService;
        this.envelopeCipher = envelopeCipher;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional
    public DoctorSummaryResponse createDoctor(String hospitalDid, CreateDoctorRequest request) {
        HospitalAccount hospital = hospitalAccountRepository.findById(hospitalDid)
                .orElseThrow(() -> new NotFoundException("Hospital not found: " + hospitalDid));

        if (doctorAccountRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered: " + request.email());
        }

        byte[] dek = hospitalKeyUnwrapService.unwrapDek(
                hospital.getHospitalDid(), hospital.getHospitalDid(), request.adminPassword());

        RawKeyPair edKeyPair = keyPairService.generateEd25519();
        RawKeyPair x25KeyPair = keyPairService.generateX25519();
        DidRegistry didRecord = didRegistryService.register(
                EntityType.PROVIDER, edKeyPair.publicKey(), x25KeyPair.publicKey());
        String doctorDid = didRecord.getDid();

        DoctorAccount doctor = new DoctorAccount(
                doctorDid,
                hospital.getHospitalDid(),
                request.fullName(),
                request.email(),
                passwordEncoder.encode(request.defaultPassword()),
                request.role(),
                request.department(),
                request.licenceNumber(),
                envelopeCipher.sealWithPassword(request.defaultPassword(), edKeyPair.privateKey()),
                envelopeCipher.sealWithPassword(request.defaultPassword(), x25KeyPair.privateKey()));
        doctorAccountRepository.save(doctor);

        byte[] wrappedDekForDoctor = envelopeCipher.sealWithPassword(request.defaultPassword(), dek);
        hospitalKeyGrantRepository.save(new HospitalKeyGrant(hospital.getHospitalDid(), doctorDid, wrappedDekForDoctor));

        auditService.record(hospital.getHospitalDid(), AuditAction.DOCTOR_ADDED, doctorDid, "DOCTOR", null);
        return DoctorSummaryResponse.from(doctor);
    }

    @Transactional(readOnly = true)
    public List<DoctorSummaryResponse> listDoctors(String hospitalDid) {
        return doctorAccountRepository.findByHospitalDid(hospitalDid).stream()
                .map(DoctorSummaryResponse::from)
                .toList();
    }
}
