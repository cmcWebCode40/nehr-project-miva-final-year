package ng.nehr.backend.common.crypto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EnvelopeCipherTest {

    private final Argon2idKdf argon2idKdf = new Argon2idKdf();
    private final XChaCha20Poly1305Cipher cipher = new XChaCha20Poly1305Cipher();
    private final EnvelopeCipher envelope = new EnvelopeCipher(argon2idKdf, cipher);

    @Test
    void keyBasedSealOpenRoundTrips() {
        byte[] key = cipher.generateKey();
        byte[] plaintext = "hospital ed25519 private key bytes".getBytes();

        byte[] sealed = envelope.sealWithKey(key, plaintext);
        byte[] opened = envelope.openWithKey(key, sealed);

        assertThat(opened).isEqualTo(plaintext);
    }

    @Test
    void keyBasedOpenFailsWithWrongKey() {
        byte[] key = cipher.generateKey();
        byte[] wrongKey = cipher.generateKey();
        byte[] sealed = envelope.sealWithKey(key, "secret".getBytes());

        assertThatThrownBy(() -> envelope.openWithKey(wrongKey, sealed))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void passwordBasedSealOpenRoundTrips() {
        byte[] plaintext = "doctor ed25519 private key bytes".getBytes();

        byte[] sealed = envelope.sealWithPassword("Correct-Horse-Battery-Staple", plaintext);
        byte[] opened = envelope.openWithPassword("Correct-Horse-Battery-Staple", sealed);

        assertThat(opened).isEqualTo(plaintext);
    }

    @Test
    void passwordBasedOpenFailsWithWrongPassword() {
        byte[] sealed = envelope.sealWithPassword("right-password", "secret".getBytes());

        assertThatThrownBy(() -> envelope.openWithPassword("wrong-password", sealed))
                .isInstanceOf(SecurityException.class);
    }

    @Test
    void sameDekCanBeWrappedForMultiplePrincipalsAndUnwrappedIndependently() {
        byte[] dek = cipher.generateKey();

        byte[] adminGrant = envelope.sealWithPassword("admin-password", dek);
        byte[] doctorGrant = envelope.sealWithPassword("doctor-default-password", dek);

        assertThat(envelope.openWithPassword("admin-password", adminGrant)).isEqualTo(dek);
        assertThat(envelope.openWithPassword("doctor-default-password", doctorGrant)).isEqualTo(dek);
    }
}
