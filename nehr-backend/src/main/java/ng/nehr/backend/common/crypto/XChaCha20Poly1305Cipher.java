package ng.nehr.backend.common.crypto;

import org.bouncycastle.crypto.InvalidCipherTextException;
import org.bouncycastle.crypto.modes.ChaCha20Poly1305;
import org.bouncycastle.crypto.params.AEADParameters;
import org.bouncycastle.crypto.params.KeyParameter;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Arrays;

/**
 * XChaCha20-Poly1305 AEAD (192-bit nonce), per draft-irtf-cfrg-xchacha and
 * RFC 8439. Chosen over AES-GCM per the project's ch.3.6.2 crypto table:
 * faster than AES without hardware acceleration, and a large random nonce
 * removes any nonce-reuse risk across the many independent encryptions
 * this system performs (patient records, wrapped keys).
 */
@Component
public class XChaCha20Poly1305Cipher {

    public static final int KEY_LENGTH = 32;
    public static final int NONCE_LENGTH = 24;
    public static final int TAG_LENGTH = 16;
    private static final byte[] NO_AAD = new byte[0];

    private final SecureRandom random = new SecureRandom();

    public byte[] generateKey() {
        byte[] key = new byte[KEY_LENGTH];
        random.nextBytes(key);
        return key;
    }

    public byte[] generateNonce() {
        byte[] nonce = new byte[NONCE_LENGTH];
        random.nextBytes(nonce);
        return nonce;
    }

    public byte[] encrypt(byte[] key, byte[] nonce, byte[] aad, byte[] plaintext) {
        ChaCha20Poly1305 cipher = new ChaCha20Poly1305();
        cipher.init(true, aeadParameters(key, nonce, aad));
        byte[] out = new byte[cipher.getOutputSize(plaintext.length)];
        int len = cipher.processBytes(plaintext, 0, plaintext.length, out, 0);
        try {
            cipher.doFinal(out, len);
        } catch (InvalidCipherTextException e) {
            throw new IllegalStateException("XChaCha20-Poly1305 encryption failed", e);
        }
        return out;
    }

    public byte[] decrypt(byte[] key, byte[] nonce, byte[] aad, byte[] ciphertextWithTag) {
        ChaCha20Poly1305 cipher = new ChaCha20Poly1305();
        cipher.init(false, aeadParameters(key, nonce, aad));
        byte[] out = new byte[cipher.getOutputSize(ciphertextWithTag.length)];
        int len = cipher.processBytes(ciphertextWithTag, 0, ciphertextWithTag.length, out, 0);
        try {
            int finalLen = len + cipher.doFinal(out, len);
            return finalLen == out.length ? out : Arrays.copyOf(out, finalLen);
        } catch (InvalidCipherTextException e) {
            throw new SecurityException("XChaCha20-Poly1305 authentication failed", e);
        }
    }

    private AEADParameters aeadParameters(byte[] key32, byte[] nonce24, byte[] aad) {
        if (key32.length != KEY_LENGTH) {
            throw new IllegalArgumentException("Key must be " + KEY_LENGTH + " bytes");
        }
        if (nonce24.length != NONCE_LENGTH) {
            throw new IllegalArgumentException("Nonce must be " + NONCE_LENGTH + " bytes");
        }
        byte[] subKey = HChaCha20.subKey(key32, Arrays.copyOfRange(nonce24, 0, 16));
        byte[] innerNonce = new byte[12];
        System.arraycopy(nonce24, 16, innerNonce, 4, 8);
        return new AEADParameters(new KeyParameter(subKey), TAG_LENGTH * 8, innerNonce, aad != null ? aad : NO_AAD);
    }
}
