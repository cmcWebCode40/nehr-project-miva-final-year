package ng.nehr.backend.common.crypto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class Argon2idKdfTest {

    private final Argon2idKdf kdf = new Argon2idKdf();

    @Test
    void sameSaltAndPasswordProduceSameKey() {
        byte[] salt = kdf.generateSalt();
        byte[] key1 = kdf.deriveKey("correct-password", salt, 32);
        byte[] key2 = kdf.deriveKey("correct-password", salt, 32);
        assertThat(key1).isEqualTo(key2);
    }

    @Test
    void differentPasswordsProduceDifferentKeys() {
        byte[] salt = kdf.generateSalt();
        byte[] key1 = kdf.deriveKey("correct-password", salt, 32);
        byte[] key2 = kdf.deriveKey("wrong-password", salt, 32);
        assertThat(key1).isNotEqualTo(key2);
    }

    @Test
    void differentSaltsProduceDifferentKeysForSamePassword() {
        byte[] key1 = kdf.deriveKey("same-password", kdf.generateSalt(), 32);
        byte[] key2 = kdf.deriveKey("same-password", kdf.generateSalt(), 32);
        assertThat(key1).isNotEqualTo(key2);
    }

    @Test
    void generatesSixteenByteSalts() {
        assertThat(kdf.generateSalt()).hasSize(16);
    }
}
