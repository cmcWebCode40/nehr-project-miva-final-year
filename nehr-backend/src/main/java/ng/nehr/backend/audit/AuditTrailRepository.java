package ng.nehr.backend.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;

public interface AuditTrailRepository extends JpaRepository<AuditTrail, Long> {

    Optional<AuditTrail> findFirstByOrderByEntryIdDesc();

    @Query("SELECT a FROM AuditTrail a WHERE a.actorDid IN :dids OR a.targetDid IN :dids ORDER BY a.entryId DESC")
    Page<AuditTrail> findInvolvingAnyOf(@Param("dids") Collection<String> dids, Pageable pageable);
}
