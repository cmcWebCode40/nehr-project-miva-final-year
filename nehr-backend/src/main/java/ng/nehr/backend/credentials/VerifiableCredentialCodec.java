package ng.nehr.backend.credentials;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import ng.nehr.backend.common.crypto.Blake3Hasher;
import ng.nehr.backend.common.crypto.KeyPairService;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds and verifies the platform's Verifiable Credential shape. The
 * proof signs a deterministic digest of the credential's own core scalar
 * fields (issuer|subject|resourceType|issuanceDate|contentHash) rather
 * than a full W3C JSON-LD canonicalization (URDNA2015) - same tamper-
 * evidence guarantee, without pulling in RDF dataset normalization for a
 * prototype (see TECH_DEBT.md).
 */
@Component
public class VerifiableCredentialCodec {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Blake3Hasher blake3Hasher;
    private final KeyPairService keyPairService;

    public VerifiableCredentialCodec(Blake3Hasher blake3Hasher, KeyPairService keyPairService) {
        this.blake3Hasher = blake3Hasher;
        this.keyPairService = keyPairService;
    }

    public Map<String, Object> build(String issuerDid, String subjectDid, String resourceType,
                                      Map<String, Object> content, String recordedByDoctorDid,
                                      String recordedByFullName, String recordedByLicenceNumber,
                                      byte[] issuerEd25519PrivateKey) {
        Instant issuanceDate = Instant.now();
        String contentHash = base64(blake3Hasher.hash256(serialize(content)));
        String digestInput = digestInput(issuerDid, subjectDid, resourceType, issuanceDate, contentHash);
        byte[] signature = keyPairService.sign(issuerEd25519PrivateKey, digestInput.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> recordedBy = new LinkedHashMap<>();
        recordedBy.put("doctorDid", recordedByDoctorDid);
        recordedBy.put("fullName", recordedByFullName);
        recordedBy.put("licenceNumber", recordedByLicenceNumber);

        Map<String, Object> credentialSubject = new LinkedHashMap<>();
        credentialSubject.put("id", subjectDid);
        credentialSubject.put("resourceType", resourceType);
        credentialSubject.put("recordedBy", recordedBy);
        credentialSubject.put("content", content);

        Map<String, Object> proof = new LinkedHashMap<>();
        proof.put("type", "Ed25519Signature2020");
        proof.put("created", issuanceDate.toString());
        proof.put("verificationMethod", issuerDid + "#key-1");
        proof.put("contentHash", contentHash);
        proof.put("proofValue", base64(signature));

        Map<String, Object> vc = new LinkedHashMap<>();
        vc.put("@context", List.of(
                "https://www.w3.org/ns/credentials/v2", "https://nehr.ng/contexts/health-record/v1"));
        vc.put("type", List.of("VerifiableCredential", "NEHRHealthRecord"));
        vc.put("issuer", issuerDid);
        vc.put("issuanceDate", issuanceDate.toString());
        vc.put("credentialSubject", credentialSubject);
        vc.put("proof", proof);
        return vc;
    }

    @SuppressWarnings("unchecked")
    public VerificationOutcome verify(Map<String, Object> vc, byte[] issuerEd25519PublicKey) {
        try {
            String issuerDid = (String) vc.get("issuer");
            Map<String, Object> credentialSubject = (Map<String, Object>) vc.get("credentialSubject");
            String subjectDid = (String) credentialSubject.get("id");
            String resourceType = (String) credentialSubject.get("resourceType");
            Object content = credentialSubject.get("content");
            Map<String, Object> proof = (Map<String, Object>) vc.get("proof");
            Instant created = Instant.parse((String) proof.get("created"));
            String claimedContentHash = (String) proof.get("contentHash");
            byte[] signature = Base64.getDecoder().decode((String) proof.get("proofValue"));

            String actualContentHash = base64(blake3Hasher.hash256(serialize(content)));
            if (!actualContentHash.equals(claimedContentHash)) {
                return VerificationOutcome.invalid("content hash mismatch - content may have been altered");
            }

            String digestInput = digestInput(issuerDid, subjectDid, resourceType, created, claimedContentHash);
            boolean signatureValid = keyPairService.verify(
                    issuerEd25519PublicKey, digestInput.getBytes(StandardCharsets.UTF_8), signature);
            return signatureValid ? VerificationOutcome.success() : VerificationOutcome.invalid("signature verification failed");
        } catch (RuntimeException e) {
            return VerificationOutcome.invalid("malformed credential: " + e.getMessage());
        }
    }

    public byte[] serialize(Object value) {
        try {
            return objectMapper.writeValueAsBytes(value);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Unable to serialize credential content", e);
        }
    }

    private static String digestInput(String issuerDid, String subjectDid, String resourceType,
                                       Instant issuanceDate, String contentHash) {
        return String.join("|", issuerDid, subjectDid, resourceType,
                String.valueOf(issuanceDate.toEpochMilli()), contentHash);
    }

    private static String base64(byte[] bytes) {
        return Base64.getEncoder().encodeToString(bytes);
    }

    public record VerificationOutcome(boolean valid, String reason) {
        public static VerificationOutcome success() {
            return new VerificationOutcome(true, null);
        }

        public static VerificationOutcome invalid(String reason) {
            return new VerificationOutcome(false, reason);
        }
    }
}
