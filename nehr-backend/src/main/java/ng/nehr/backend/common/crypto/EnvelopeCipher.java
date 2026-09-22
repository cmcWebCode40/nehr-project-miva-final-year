package ng.nehr.backend.common.crypto;

import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Two sealed-box formats built on {@link XChaCha20Poly1305Cipher}:
 * <ul>
 *   <li>{@code sealWithKey}/{@code openWithKey} - encrypts directly under a
 *       raw symmetric key (nonce || ciphertext+tag). Used for hospital
 *       signing/encryption private keys, which are protected by a
 *       generated DEK rather than a human's password.</li>
 *   <li>{@code sealWithPassword}/{@code openWithPassword} - derives the key
 *       from a password via Argon2id first (salt || nonce || ciphertext+tag).
 *       Used for a doctor's personal key material and for wrapping a copy
 *       of a hospital's DEK per grant-holder.</li>
 * </ul>
 */
@Component
public class EnvelopeCipher {

    private final Argon2idKdf argon2idKdf;
    private final XChaCha20Poly1305Cipher cipher;

    public EnvelopeCipher(Argon2idKdf argon2idKdf, XChaCha20Poly1305Cipher cipher) {
        this.argon2idKdf = argon2idKdf;
        this.cipher = cipher;
    }

    public byte[] sealWithKey(byte[] key, byte[] plaintext) {
        byte[] nonce = cipher.generateNonce();
        byte[] ciphertext = cipher.encrypt(key, nonce, null, plaintext);
        return concat(nonce, ciphertext);
    }

    public byte[] openWithKey(byte[] key, byte[] sealed) {
        byte[] nonce = Arrays.copyOfRange(sealed, 0, XChaCha20Poly1305Cipher.NONCE_LENGTH);
        byte[] ciphertext = Arrays.copyOfRange(sealed, XChaCha20Poly1305Cipher.NONCE_LENGTH, sealed.length);
        return cipher.decrypt(key, nonce, null, ciphertext);
    }

    public byte[] sealWithPassword(String password, byte[] plaintext) {
        byte[] salt = argon2idKdf.generateSalt();
        byte[] key = argon2idKdf.deriveKey(password, salt, XChaCha20Poly1305Cipher.KEY_LENGTH);
        byte[] nonce = cipher.generateNonce();
        byte[] ciphertext = cipher.encrypt(key, nonce, null, plaintext);
        return concat(salt, nonce, ciphertext);
    }

    public byte[] openWithPassword(String password, byte[] sealed) {
        int saltLen = Argon2idKdf.SALT_LENGTH;
        int nonceLen = XChaCha20Poly1305Cipher.NONCE_LENGTH;
        byte[] salt = Arrays.copyOfRange(sealed, 0, saltLen);
        byte[] nonce = Arrays.copyOfRange(sealed, saltLen, saltLen + nonceLen);
        byte[] ciphertext = Arrays.copyOfRange(sealed, saltLen + nonceLen, sealed.length);
        byte[] key = argon2idKdf.deriveKey(password, salt, XChaCha20Poly1305Cipher.KEY_LENGTH);
        return cipher.decrypt(key, nonce, null, ciphertext);
    }

    private static byte[] concat(byte[]... parts) {
        int total = 0;
        for (byte[] part : parts) {
            total += part.length;
        }
        byte[] out = new byte[total];
        int offset = 0;
        for (byte[] part : parts) {
            System.arraycopy(part, 0, out, offset, part.length);
            offset += part.length;
        }
        return out;
    }
}
