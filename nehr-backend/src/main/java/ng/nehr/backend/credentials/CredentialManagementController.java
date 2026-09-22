package ng.nehr.backend.credentials;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.credentials.dto.CredentialSummaryResponse;
import ng.nehr.backend.credentials.dto.RevokeCredentialRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Doctor-scoped (not hospital-admin-scoped, unlike most {@code /hospitals/**}
 * endpoints) because issuing and revoking credentials is staff's job day to
 * day - consent is granted to the hospital as a whole, so any doctor there
 * can revoke any credential their hospital issued, matching
 * {@code ConsentService}'s existing hospital-level consent model.
 */
@RestController
@RequestMapping("/api/v1/doctors/me/credentials")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Credentials", description = "Consent requests and Verifiable Credential issuance/verification")
public class CredentialManagementController {

    private final CredentialIssuanceService service;

    public CredentialManagementController(CredentialIssuanceService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List credentials issued by the authenticated doctor's hospital",
            description = "Metadata only (record id, patient, issued-at, revoked) - the content "
                    + "itself is encrypted for the patient and unreadable by the hospital once issued.")
    public List<CredentialSummaryResponse> list(@AuthenticationPrincipal ActorPrincipal doctor) {
        return service.listForHospital(doctor.hospitalDid());
    }

    @PostMapping("/{recordId}/revoke")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Revoke a previously issued credential",
            description = "Only the issuing hospital may revoke its own credential. Idempotent.")
    public void revoke(@AuthenticationPrincipal ActorPrincipal doctor, @PathVariable String recordId,
                        @RequestBody(required = false) RevokeCredentialRequest request) {
        service.revoke(doctor.hospitalDid(), doctor.subject(), recordId,
                request != null ? request.reason() : null);
    }
}
