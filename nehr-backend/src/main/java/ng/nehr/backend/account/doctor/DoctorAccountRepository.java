package ng.nehr.backend.account.doctor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorAccountRepository extends JpaRepository<DoctorAccount, String> {

    Optional<DoctorAccount> findByEmail(String email);

    boolean existsByEmail(String email);

    List<DoctorAccount> findByHospitalDid(String hospitalDid);
}
