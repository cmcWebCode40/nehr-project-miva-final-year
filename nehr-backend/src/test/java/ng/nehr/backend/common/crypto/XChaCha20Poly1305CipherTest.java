package ng.nehr.backend.common.crypto;

import org.junit.jupiter.api.Test;

import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Verifies the hand-written HChaCha20 subkey derivation against the
 * libsodium-generated test vectors from
 * github.com/webmaster128/xchacha20poly1305-testvectors (key = 32 zero
 * bytes, nonce = 0x00..0x17), since Bouncy Castle has no native XChaCha20
 * implementation to compare against directly.
 */
class XChaCha20Poly1305CipherTest {

    private static final HexFormat HEX = HexFormat.of();
    private static final XChaCha20Poly1305Cipher CIPHER = new XChaCha20Poly1305Cipher();

    private static final byte[] KEY = new byte[32];
    private static final byte[] NONCE = HEX.parseHex("000102030405060708090a0b0c0d0e0f1011121314151617");

    @Test
    void encryptsEmptyPlaintextWithEmptyAad() {
        byte[] out = CIPHER.encrypt(KEY, NONCE, null, new byte[0]);
        assertThat(HEX.formatHex(out)).isEqualTo("174b0ab46342cb76f9f89b40bfdc4667");
    }

    @Test
    void encryptsEmptyPlaintextWithOneByteAad() {
        byte[] aad = HEX.parseHex("00");
        byte[] out = CIPHER.encrypt(KEY, NONCE, aad, new byte[0]);
        assertThat(HEX.formatHex(out)).isEqualTo("2715f838a4391c781713ab73bfe2f245");
    }

    @Test
    void encryptsSixtyThreeByteZeroPlaintextWithEmptyAad() {
        byte[] plaintext = new byte[63];
        byte[] out = CIPHER.encrypt(KEY, NONCE, null, plaintext);
        String expectedCiphertext = "bdd7e252f03161a122022965980cc3e3d39b105b6423da3f1b3135499fbc016c"
                + "3e8790e94cc2bf51374aa1419a7d22f8f9ca7a8491554e1777ecfbbc50649a";
        String expectedTag = "eecf2b23972c0a1bc26cfa90ecea3fd6";
        assertThat(HEX.formatHex(out)).isEqualTo(expectedCiphertext + expectedTag);
    }

    @Test
    void encryptsSixtyThreeByteZeroPlaintextWithOneByteAad() {
        byte[] aad = HEX.parseHex("00");
        byte[] plaintext = new byte[63];
        byte[] out = CIPHER.encrypt(KEY, NONCE, aad, plaintext);
        String expectedCiphertext = "bdd7e252f03161a122022965980cc3e3d39b105b6423da3f1b3135499fbc016c"
                + "3e8790e94cc2bf51374aa1419a7d22f8f9ca7a8491554e1777ecfbbc50649a";
        String expectedTag = "15709142d2d50d05af62f15ef7f0eb88";
        assertThat(HEX.formatHex(out)).isEqualTo(expectedCiphertext + expectedTag);
    }

    @Test
    void decryptIsInverseOfEncryptForRandomKeyNonceAndAad() {
        byte[] key = CIPHER.generateKey();
        byte[] nonce = CIPHER.generateNonce();
        byte[] aad = "consent-scope-v1".getBytes();
        byte[] plaintext = "sample FHIR resource payload".getBytes();

        byte[] sealed = CIPHER.encrypt(key, nonce, aad, plaintext);
        byte[] opened = CIPHER.decrypt(key, nonce, aad, sealed);

        assertThat(opened).isEqualTo(plaintext);
    }

    @Test
    void decryptFailsWhenCiphertextIsTampered() {
        byte[] key = CIPHER.generateKey();
        byte[] nonce = CIPHER.generateNonce();
        byte[] sealed = CIPHER.encrypt(key, nonce, null, "secret".getBytes());
        sealed[0] ^= 0x01;

        assertThatThrownBy(() -> CIPHER.decrypt(key, nonce, null, sealed))
                .isInstanceOf(SecurityException.class);
    }
}
