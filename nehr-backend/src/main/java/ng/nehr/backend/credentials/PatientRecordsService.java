package ng.nehr.backend.credentials;

import ng.nehr.backend.common.web.NotFoundException;
import ng.nehr.backend.credentials.dto.PatientRecordDetail;
import ng.nehr.backend.credentials.dto.PatientRecordSummary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PatientRecordsService {

    private final EncryptedRecordRepository repository;
    private final RevokedCredentialRepository revokedCredentialRepository;

    public PatientRecordsService(EncryptedRecordRepository repository,
                                  RevokedCredentialRepository revokedCredentialRepository) {
        this.repository = repository;
        this.revokedCredentialRepository = revokedCredentialRepository;
    }

    @Transactional(readOnly = true)
    public List<PatientRecordSummary> listMine(String patientDid) {
        return repository.findByOwnerDid(patientDid).stream()
                .map(record -> PatientRecordSummary.from(record, revokedCredentialRepository.existsById(record.getRecordId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientRecordDetail getMine(String patientDid, String recordId) {
        return repository.findByRecordIdAndOwnerDid(recordId, patientDid)
                .map(record -> PatientRecordDetail.from(record, revokedCredentialRepository.existsById(recordId)))
                .orElseThrow(() -> new NotFoundException("Record not found: " + recordId));
    }
}
