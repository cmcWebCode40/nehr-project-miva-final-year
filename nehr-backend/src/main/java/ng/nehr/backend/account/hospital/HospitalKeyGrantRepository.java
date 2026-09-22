package ng.nehr.backend.account.hospital;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalKeyGrantRepository extends JpaRepository<HospitalKeyGrant, Long> {

    Optional<HospitalKeyGrant> findByHospitalDidAndPrincipalDidAndRevokedAtIsNull(
            String hospitalDid, String principalDid);
}
