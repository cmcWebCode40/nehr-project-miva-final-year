package ng.nehr.backend.audit;

import ng.nehr.backend.common.crypto.Blake3Hasher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collection;
import java.util.Map;

@Service
public class AuditService {

    private static final String GENESIS_HASH = "GENESIS";

    private final AuditTrailRepository repository;
    private final Blake3Hasher blake3Hasher;

    public AuditService(AuditTrailRepository repository, Blake3Hasher blake3Hasher) {
        this.repository = repository;
        this.blake3Hasher = blake3Hasher;
    }

    /**
     * REQUIRES_NEW so a caller in a read-only transaction (most login
     * methods) can still record an audit entry, and so this always
     * commits independently of whatever the caller does afterward.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String actorDid, AuditAction action, String targetDid, String targetType,
                        Map<String, Object> details) {
        String previousHash = repository.findFirstByOrderByEntryIdDesc()
                .map(this::hashOf)
                .orElse(GENESIS_HASH);
        repository.save(new AuditTrail(actorDid, action.name(), targetDid, targetType, details, previousHash));
    }

    @Transactional(readOnly = true)
    public Page<AuditTrail> listAll(int limit) {
        return repository.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "entryId")));
    }

    @Transactional(readOnly = true)
    public Page<AuditTrail> listInvolving(Collection<String> dids, int limit) {
        return repository.findInvolvingAnyOf(dids, PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "entryId")));
    }

    private String hashOf(AuditTrail entry) {
        byte[] payload = entry.canonicalPayload().getBytes(StandardCharsets.UTF_8);
        return Base64.getEncoder().encodeToString(blake3Hasher.hash256(payload));
    }
}
