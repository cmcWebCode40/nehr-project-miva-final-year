package ng.nehr.backend.credentials;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.credentials.dto.IssueCredentialRequest;
import ng.nehr.backend.credentials.dto.IssueCredentialResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/doctors/me/patients/{patientDid}/credentials")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Credentials", description = "Consent requests and Verifiable Credential issuance/verification")
public class CredentialIssuanceController {

    private final CredentialIssuanceService service;

    public CredentialIssuanceController(CredentialIssuanceService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Issue a hospital-signed Verifiable Credential to a patient",
            description = "Doctor only, gated by an active granted consent covering the resource "
                    + "type. Signed with the hospital's institutional Ed25519 key and encrypted "
                    + "for the patient via X25519 - the server never stores plaintext content.")
    public IssueCredentialResponse issue(@AuthenticationPrincipal ActorPrincipal doctor,
                                          @PathVariable String patientDid,
                                          @Valid @RequestBody IssueCredentialRequest request) {
        return service.issue(doctor.hospitalDid(), doctor.subject(), patientDid, request);
    }
}
