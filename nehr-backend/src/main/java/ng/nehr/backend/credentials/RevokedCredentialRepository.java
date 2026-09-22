package ng.nehr.backend.credentials;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedCredentialRepository extends JpaRepository<RevokedCredential, String> {
}
