package ng.nehr.backend.common.crypto;

import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * Argon2id key derivation, tuned for a single request on a commodity
 * server (not a mobile device): 64 MB memory, 3 iterations, single lane.
 */
@Component
public class Argon2idKdf {

    public static final int SALT_LENGTH = 16;
    private static final int ITERATIONS = 3;
    private static final int MEMORY_KB = 65536;
    private static final int PARALLELISM = 1;

    private final SecureRandom random = new SecureRandom();

    public byte[] generateSalt() {
        byte[] salt = new byte[SALT_LENGTH];
        random.nextBytes(salt);
        return salt;
    }

    public byte[] deriveKey(String password, byte[] salt, int outputLength) {
        Argon2Parameters params = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                .withIterations(ITERATIONS)
                .withMemoryAsKB(MEMORY_KB)
                .withParallelism(PARALLELISM)
                .withSalt(salt)
                .build();
        Argon2BytesGenerator generator = new Argon2BytesGenerator();
        generator.init(params);
        byte[] out = new byte[outputLength];
        generator.generateBytes(password.toCharArray(), out);
        return out;
    }
}
