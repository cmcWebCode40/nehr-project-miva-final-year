package ng.nehr.backend.credentials;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.credentials.dto.VerifyCredentialRequest;
import ng.nehr.backend.credentials.dto.VerifyCredentialResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/credentials")
@Tag(name = "Credentials", description = "Consent requests and Verifiable Credential issuance/verification")
public class CredentialVerificationController {

    private final CredentialVerificationService service;

    public CredentialVerificationController(CredentialVerificationService service) {
        this.service = service;
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify a presented credential",
            description = "Public - no authentication required. Resolves the issuer's DID and "
                    + "checks the signature; does not require contacting the issuing hospital "
                    + "(FR-06).")
    public VerifyCredentialResponse verify(@Valid @RequestBody VerifyCredentialRequest request) {
        return service.verify(request.credential());
    }
}
