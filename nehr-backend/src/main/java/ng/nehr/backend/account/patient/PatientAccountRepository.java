package ng.nehr.backend.account.patient;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientAccountRepository extends JpaRepository<PatientAccount, String> {

    Optional<PatientAccount> findByEmail(String email);

    boolean existsByEmail(String email);
}
