package ng.nehr.backend.identity.dto;

import ng.nehr.backend.identity.DidRegistry;
import ng.nehr.backend.identity.DidStatus;

import java.time.Instant;
import java.util.Map;

/** Shape follows the W3C DID Resolution specification's result envelope. */
public record DidResolutionResult(
        Map<String, Object> didDocument,
        DidDocumentMetadata didDocumentMetadata,
        DidResolutionMetadata didResolutionMetadata) {

    public static DidResolutionResult from(DidRegistry record) {
        return new DidResolutionResult(
                record.getDidDocument(),
                new DidDocumentMetadata(record.getCreatedAt(), record.getUpdatedAt(),
                        record.getStatus() == DidStatus.DEACTIVATED),
                new DidResolutionMetadata("application/did+json", Instant.now()));
    }

    public record DidDocumentMetadata(Instant created, Instant updated, boolean deactivated) {
    }

    public record DidResolutionMetadata(String contentType, Instant retrieved) {
    }
}
