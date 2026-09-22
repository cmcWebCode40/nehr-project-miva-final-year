package ng.nehr.backend.consent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConsentRecordRepository extends JpaRepository<ConsentRecord, String> {

    List<ConsentRecord> findByGrantorDid(String grantorDid);

    List<ConsentRecord> findByGranteeDid(String granteeDid);

    Optional<ConsentRecord> findByConsentIdAndGrantorDid(String consentId, String grantorDid);

    List<ConsentRecord> findByGrantorDidAndGranteeDidAndStatus(
            String grantorDid, String granteeDid, ConsentStatus status);
}
