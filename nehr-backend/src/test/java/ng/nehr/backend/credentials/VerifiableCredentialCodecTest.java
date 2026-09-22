package ng.nehr.backend.credentials;

import ng.nehr.backend.common.crypto.Blake3Hasher;
import ng.nehr.backend.common.crypto.KeyPairService;
import ng.nehr.backend.common.crypto.RawKeyPair;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class VerifiableCredentialCodecTest {

    private final KeyPairService keyPairService = new KeyPairService();
    private final VerifiableCredentialCodec codec =
            new VerifiableCredentialCodec(new Blake3Hasher(), keyPairService);

    private Map<String, Object> sampleContent() {
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("status", "final");
        content.put("code", "85354-9");
        content.put("value", "120/80");
        return content;
    }

    @Test
    void issuedCredentialVerifiesAgainstIssuerPublicKey() {
        RawKeyPair issuerKeys = keyPairService.generateEd25519();

        Map<String, Object> vc = codec.build(
                "did:nehr:hospital1", "did:nehr:patient1", "Observation", sampleContent(),
                "did:nehr:doctor1", "Dr. Amaka Okoye", "MDCN-12345", issuerKeys.privateKey());

        VerifiableCredentialCodec.VerificationOutcome outcome = codec.verify(vc, issuerKeys.publicKey());

        assertThat(outcome.valid()).isTrue();
    }

    @Test
    void verificationFailsAgainstWrongIssuerKey() {
        RawKeyPair issuerKeys = keyPairService.generateEd25519();
        RawKeyPair otherKeys = keyPairService.generateEd25519();

        Map<String, Object> vc = codec.build(
                "did:nehr:hospital1", "did:nehr:patient1", "Observation", sampleContent(),
                "did:nehr:doctor1", "Dr. Amaka Okoye", "MDCN-12345", issuerKeys.privateKey());

        VerifiableCredentialCodec.VerificationOutcome outcome = codec.verify(vc, otherKeys.publicKey());

        assertThat(outcome.valid()).isFalse();
    }

    @Test
    @SuppressWarnings("unchecked")
    void tamperedContentFailsVerificationEvenWithValidSignatureFields() {
        RawKeyPair issuerKeys = keyPairService.generateEd25519();
        Map<String, Object> vc = codec.build(
                "did:nehr:hospital1", "did:nehr:patient1", "Observation", sampleContent(),
                "did:nehr:doctor1", "Dr. Amaka Okoye", "MDCN-12345", issuerKeys.privateKey());

        Map<String, Object> credentialSubject = (Map<String, Object>) vc.get("credentialSubject");
        Map<String, Object> tamperedContent = new LinkedHashMap<>((Map<String, Object>) credentialSubject.get("content"));
        tamperedContent.put("value", "200/120");
        credentialSubject.put("content", tamperedContent);

        VerifiableCredentialCodec.VerificationOutcome outcome = codec.verify(vc, issuerKeys.publicKey());

        assertThat(outcome.valid()).isFalse();
        assertThat(outcome.reason()).contains("content hash mismatch");
    }

    @Test
    @SuppressWarnings("unchecked")
    void tamperedIssuerFailsVerification() {
        RawKeyPair issuerKeys = keyPairService.generateEd25519();
        Map<String, Object> vc = codec.build(
                "did:nehr:hospital1", "did:nehr:patient1", "Observation", sampleContent(),
                "did:nehr:doctor1", "Dr. Amaka Okoye", "MDCN-12345", issuerKeys.privateKey());

        vc.put("issuer", "did:nehr:some-other-hospital");

        VerifiableCredentialCodec.VerificationOutcome outcome = codec.verify(vc, issuerKeys.publicKey());

        assertThat(outcome.valid()).isFalse();
    }

    @Test
    void credentialSubjectCarriesRecordedByDoctorMetadata() {
        RawKeyPair issuerKeys = keyPairService.generateEd25519();
        Map<String, Object> vc = codec.build(
                "did:nehr:hospital1", "did:nehr:patient1", "Observation", sampleContent(),
                "did:nehr:doctor1", "Dr. Amaka Okoye", "MDCN-12345", issuerKeys.privateKey());

        @SuppressWarnings("unchecked")
        Map<String, Object> credentialSubject = (Map<String, Object>) vc.get("credentialSubject");
        @SuppressWarnings("unchecked")
        Map<String, Object> recordedBy = (Map<String, Object>) credentialSubject.get("recordedBy");

        assertThat(recordedBy.get("doctorDid")).isEqualTo("did:nehr:doctor1");
        assertThat(recordedBy.get("fullName")).isEqualTo("Dr. Amaka Okoye");
        assertThat(recordedBy.get("licenceNumber")).isEqualTo("MDCN-12345");
    }
}
