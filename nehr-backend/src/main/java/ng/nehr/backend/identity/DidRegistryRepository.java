package ng.nehr.backend.identity;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DidRegistryRepository extends JpaRepository<DidRegistry, String> {
}
