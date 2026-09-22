package ng.nehr.backend.credentials;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EncryptedRecordRepository extends JpaRepository<EncryptedRecord, String> {

    List<EncryptedRecord> findByOwnerDid(String ownerDid);

    Optional<EncryptedRecord> findByRecordIdAndOwnerDid(String recordId, String ownerDid);

    List<EncryptedRecord> findByIssuerDidAndRecordTypeOrderByCreatedAtDesc(String issuerDid, RecordType recordType);
}
