package ng.nehr.backend.identity;

import ng.nehr.backend.common.crypto.Blake3Hasher;
import ng.nehr.backend.common.crypto.Codecs;
import org.springframework.stereotype.Component;

/**
 * The did:nehr method: identifier = "did:nehr:" + base32(BLAKE3-256(ed25519 public key)).
 */
@Component
public class DidIdentifierFactory {

    private static final String METHOD_PREFIX = "did:nehr:";

    private final Blake3Hasher blake3Hasher;

    public DidIdentifierFactory(Blake3Hasher blake3Hasher) {
        this.blake3Hasher = blake3Hasher;
    }

    public String deriveDid(byte[] ed25519PublicKey) {
        byte[] hash = blake3Hasher.hash256(ed25519PublicKey);
        return METHOD_PREFIX + Codecs.base32Encode(hash);
    }
}
