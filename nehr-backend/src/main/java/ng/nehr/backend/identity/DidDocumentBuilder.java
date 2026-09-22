package ng.nehr.backend.identity;

import ng.nehr.backend.common.crypto.Codecs;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds a W3C DID Core 1.0 DID Document. The same shape is used for every
 * entity type (patient, hospital, provider) - two verification methods
 * (Ed25519 for authentication/assertion, X25519 for key agreement) and one
 * service endpoint pointing back at this registry.
 */
@Component
public class DidDocumentBuilder {

    public Map<String, Object> build(String did, byte[] ed25519PublicKey, byte[] x25519PublicKey, String baseUrl) {
        String keyId1 = did + "#key-1";
        String keyId2 = did + "#key-2";

        Map<String, Object> verificationMethod1 = new LinkedHashMap<>();
        verificationMethod1.put("id", keyId1);
        verificationMethod1.put("type", "Ed25519VerificationKey2020");
        verificationMethod1.put("controller", did);
        verificationMethod1.put("publicKeyMultibase", Codecs.multibaseEncode(ed25519PublicKey));

        Map<String, Object> verificationMethod2 = new LinkedHashMap<>();
        verificationMethod2.put("id", keyId2);
        verificationMethod2.put("type", "X25519KeyAgreementKey2020");
        verificationMethod2.put("controller", did);
        verificationMethod2.put("publicKeyMultibase", Codecs.multibaseEncode(x25519PublicKey));

        Map<String, Object> service = new LinkedHashMap<>();
        service.put("id", did + "#nehr-registry");
        service.put("type", "NEHRRegistry");
        service.put("serviceEndpoint", baseUrl + "/api/v1/dids/" + did);

        Map<String, Object> document = new LinkedHashMap<>();
        document.put("@context", List.of(
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1",
                "https://w3id.org/security/suites/x25519-2020/v1"));
        document.put("id", did);
        document.put("controller", did);
        document.put("verificationMethod", List.of(verificationMethod1, verificationMethod2));
        document.put("authentication", List.of(keyId1));
        document.put("assertionMethod", List.of(keyId1));
        document.put("keyAgreement", List.of(keyId2));
        document.put("service", List.of(service));
        return document;
    }
}
