package ng.nehr.backend.common.crypto;

import org.bouncycastle.crypto.digests.Blake3Digest;
import org.springframework.stereotype.Component;

@Component
public class Blake3Hasher {

    public byte[] hash256(byte[] input) {
        Blake3Digest digest = new Blake3Digest(256);
        digest.update(input, 0, input.length);
        byte[] out = new byte[32];
        digest.doFinal(out, 0);
        return out;
    }
}
