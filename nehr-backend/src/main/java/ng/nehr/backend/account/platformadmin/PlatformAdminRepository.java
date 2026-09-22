package ng.nehr.backend.account.platformadmin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlatformAdminRepository extends JpaRepository<PlatformAdmin, Long> {

    Optional<PlatformAdmin> findByEmail(String email);

    boolean existsByEmail(String email);
}
