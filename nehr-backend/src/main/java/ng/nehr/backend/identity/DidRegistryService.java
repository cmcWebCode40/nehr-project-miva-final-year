package ng.nehr.backend.identity;

import ng.nehr.backend.common.config.NehrProperties;
import ng.nehr.backend.common.crypto.Codecs;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class DidRegistryService {

    private final DidRegistryRepository repository;
    private final DidDocumentBuilder documentBuilder;
    private final DidIdentifierFactory identifierFactory;
    private final String baseUrl;

    public DidRegistryService(DidRegistryRepository repository,
                               DidDocumentBuilder documentBuilder,
                               DidIdentifierFactory identifierFactory,
                               NehrProperties properties) {
        this.repository = repository;
        this.documentBuilder = documentBuilder;
        this.identifierFactory = identifierFactory;
        this.baseUrl = properties.did().baseUrl();
    }

    @Transactional
    public DidRegistry register(EntityType entityType, byte[] ed25519PublicKey, byte[] x25519PublicKey) {
        String did = identifierFactory.deriveDid(ed25519PublicKey);
        if (repository.existsById(did)) {
            throw new DidAlreadyExistsException(did);
        }
        Map<String, Object> document = documentBuilder.build(did, ed25519PublicKey, x25519PublicKey, baseUrl);
        DidRegistry record = new DidRegistry(
                did,
                entityType,
                document,
                Codecs.multibaseEncode(ed25519PublicKey),
                Codecs.multibaseEncode(x25519PublicKey));
        return repository.save(record);
    }

    @Transactional(readOnly = true)
    public Optional<DidRegistry> resolve(String did) {
        return repository.findById(did);
    }

    @Transactional(readOnly = true)
    public DidRegistry getActiveOrThrow(String did) {
        DidRegistry record = repository.findById(did).orElseThrow(() -> new DidNotFoundException(did));
        if (record.getStatus() == DidStatus.DEACTIVATED) {
            throw new DidNotFoundException(did);
        }
        return record;
    }

    @Transactional
    public void deactivate(String did) {
        DidRegistry record = repository.findById(did).orElseThrow(() -> new DidNotFoundException(did));
        record.deactivate();
    }
}
