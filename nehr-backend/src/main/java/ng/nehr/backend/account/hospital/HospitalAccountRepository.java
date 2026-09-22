package ng.nehr.backend.account.hospital;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HospitalAccountRepository extends JpaRepository<HospitalAccount, String> {

    Optional<HospitalAccount> findByEmail(String email);

    boolean existsByEmail(String email);

    List<HospitalAccount> findByStatus(HospitalStatus status);
}
