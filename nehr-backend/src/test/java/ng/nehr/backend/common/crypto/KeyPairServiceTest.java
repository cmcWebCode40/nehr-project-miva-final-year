package ng.nehr.backend.common.crypto;

import org.junit.jupiter.api.Test;

import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;

class KeyPairServiceTest {

    private final KeyPairService keyPairService = new KeyPairService();

    @Test
    void generatesThirtyTwoByteEd25519Keys() {
        RawKeyPair pair = keyPairService.generateEd25519();
        assertThat(pair.publicKey()).hasSize(32);
        assertThat(pair.privateKey()).hasSize(32);
    }

    @Test
    void generatesThirtyTwoByteX25519Keys() {
        RawKeyPair pair = keyPairService.generateX25519();
        assertThat(pair.publicKey()).hasSize(32);
        assertThat(pair.privateKey()).hasSize(32);
    }

    @Test
    void signatureVerifiesAgainstMatchingPublicKey() {
        RawKeyPair pair = keyPairService.generateEd25519();
        byte[] message = "did:nehr:abc123 challenge-nonce".getBytes();

        byte[] signature = keyPairService.sign(pair.privateKey(), message);

        assertThat(keyPairService.verify(pair.publicKey(), message, signature)).isTrue();
    }

    @Test
    void signatureFailsAgainstDifferentPublicKey() {
        RawKeyPair signer = keyPairService.generateEd25519();
        RawKeyPair other = keyPairService.generateEd25519();
        byte[] message = "did:nehr:abc123 challenge-nonce".getBytes();

        byte[] signature = keyPairService.sign(signer.privateKey(), message);

        assertThat(keyPairService.verify(other.publicKey(), message, signature)).isFalse();
    }

    @Test
    void signatureFailsWhenMessageIsTampered() {
        RawKeyPair pair = keyPairService.generateEd25519();
        byte[] signature = keyPairService.sign(pair.privateKey(), "original".getBytes());

        assertThat(keyPairService.verify(pair.publicKey(), "tampered".getBytes(), signature)).isFalse();
    }

    @Test
    void successiveKeyPairsAreNotIdentical() {
        RawKeyPair first = keyPairService.generateEd25519();
        RawKeyPair second = keyPairService.generateEd25519();
        assertThat(first.privateKey()).isNotEqualTo(second.privateKey());
    }

    @Test
    void x25519AgreementMatchesRfc7748TestVector() {
        HexFormat hex = HexFormat.of();
        byte[] alicePriv = hex.parseHex("77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a");
        byte[] alicePub = hex.parseHex("8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a");
        byte[] bobPriv = hex.parseHex("5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb");
        byte[] bobPub = hex.parseHex("de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f");
        byte[] expectedShared = hex.parseHex("4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742");

        assertThat(keyPairService.agreeX25519(alicePriv, bobPub)).isEqualTo(expectedShared);
        assertThat(keyPairService.agreeX25519(bobPriv, alicePub)).isEqualTo(expectedShared);
    }

    @Test
    void x25519AgreementIsSymmetricForGeneratedKeys() {
        RawKeyPair alice = keyPairService.generateX25519();
        RawKeyPair bob = keyPairService.generateX25519();

        byte[] fromAlice = keyPairService.agreeX25519(alice.privateKey(), bob.publicKey());
        byte[] fromBob = keyPairService.agreeX25519(bob.privateKey(), alice.publicKey());

        assertThat(fromAlice).isEqualTo(fromBob);
    }
}
