package ng.nehr.backend.credentials;

import ng.nehr.backend.common.crypto.Codecs;
import ng.nehr.backend.credentials.dto.VerifyCredentialResponse;
import ng.nehr.backend.identity.DidRegistry;
import ng.nehr.backend.identity.DidRegistryService;
import ng.nehr.backend.identity.DidStatus;
import org.springframework.stereotype.Service;

import java.util.Map;

/** FR-06: any hospital can verify a presented credential using only the issuer's public DID Document. */
@Service
public class CredentialVerificationService {

    private final DidRegistryService didRegistryService;
    private final VerifiableCredentialCodec codec;

    public CredentialVerificationService(DidRegistryService didRegistryService, VerifiableCredentialCodec codec) {
        this.didRegistryService = didRegistryService;
        this.codec = codec;
    }

    public VerifyCredentialResponse verify(Map<String, Object> credential) {
        Object issuerField = credential.get("issuer");
        if (!(issuerField instanceof String issuerDid)) {
            return VerifyCredentialResponse.invalid(null, "credential has no 'issuer' field");
        }

        DidRegistry issuerRecord = didRegistryService.resolve(issuerDid).orElse(null);
        if (issuerRecord == null) {
            return VerifyCredentialResponse.invalid(issuerDid, "issuer DID not found");
        }
        if (issuerRecord.getStatus() == DidStatus.DEACTIVATED) {
            return VerifyCredentialResponse.invalid(issuerDid, "issuer DID has been deactivated");
        }

        byte[] issuerPublicKey = Codecs.multibaseDecode(issuerRecord.getPublicKeyEd());
        VerifiableCredentialCodec.VerificationOutcome outcome = codec.verify(credential, issuerPublicKey);
        return outcome.valid()
                ? VerifyCredentialResponse.valid(issuerDid)
                : VerifyCredentialResponse.invalid(issuerDid, outcome.reason());
    }
}
