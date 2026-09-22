package ng.nehr.backend.common.crypto;

import org.bouncycastle.crypto.agreement.X25519Agreement;
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters;
import org.bouncycastle.crypto.params.X25519PrivateKeyParameters;
import org.bouncycastle.crypto.params.X25519PublicKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * Ed25519 (signing) and X25519 (key agreement) key generation and signing,
 * using Bouncy Castle's lightweight API directly on raw 32-byte keys -
 * the JDK's native Ed25519/X25519 support only exposes ASN.1-wrapped
 * encodings, which is unnecessary ceremony for a method that only ever
 * stores and transmits raw key bytes.
 */
@Component
public class KeyPairService {

    private final SecureRandom random = new SecureRandom();

    public RawKeyPair generateEd25519() {
        Ed25519PrivateKeyParameters priv = new Ed25519PrivateKeyParameters(random);
        Ed25519PublicKeyParameters pub = priv.generatePublicKey();
        return new RawKeyPair(pub.getEncoded(), priv.getEncoded());
    }

    public RawKeyPair generateX25519() {
        X25519PrivateKeyParameters priv = new X25519PrivateKeyParameters(random);
        X25519PublicKeyParameters pub = priv.generatePublicKey();
        return new RawKeyPair(pub.getEncoded(), priv.getEncoded());
    }

    public byte[] sign(byte[] ed25519PrivateKey, byte[] message) {
        Ed25519PrivateKeyParameters priv = new Ed25519PrivateKeyParameters(ed25519PrivateKey, 0);
        Ed25519Signer signer = new Ed25519Signer();
        signer.init(true, priv);
        signer.update(message, 0, message.length);
        return signer.generateSignature();
    }

    public boolean verify(byte[] ed25519PublicKey, byte[] message, byte[] signature) {
        Ed25519PublicKeyParameters pub = new Ed25519PublicKeyParameters(ed25519PublicKey, 0);
        Ed25519Signer signer = new Ed25519Signer();
        signer.init(false, pub);
        signer.update(message, 0, message.length);
        return signer.verifySignature(signature);
    }

    /** X25519 Diffie-Hellman agreement - same shared secret from either side's (priv, other's pub). */
    public byte[] agreeX25519(byte[] privateKey, byte[] publicKey) {
        X25519Agreement agreement = new X25519Agreement();
        agreement.init(new X25519PrivateKeyParameters(privateKey, 0));
        byte[] sharedSecret = new byte[agreement.getAgreementSize()];
        agreement.calculateAgreement(new X25519PublicKeyParameters(publicKey, 0), sharedSecret, 0);
        return sharedSecret;
    }
}
