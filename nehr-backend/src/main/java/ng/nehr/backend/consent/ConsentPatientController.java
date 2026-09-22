package ng.nehr.backend.consent;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.consent.dto.AcceptConsentRequest;
import ng.nehr.backend.consent.dto.ConsentResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients/me/consents")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Credentials", description = "Consent requests and Verifiable Credential issuance/verification")
public class ConsentPatientController {

    private final ConsentService service;

    public ConsentPatientController(ConsentService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List consent requests concerning the authenticated patient")
    public List<ConsentResponse> list(@AuthenticationPrincipal ActorPrincipal patient) {
        return service.listForPatient(patient.subject());
    }

    @PostMapping("/{consentId}/accept")
    @Operation(summary = "Accept a pending consent request",
            description = "signature is computed client-side over the request's signingPayload "
                    + "using the patient's Ed25519 private key.")
    public ConsentResponse accept(@AuthenticationPrincipal ActorPrincipal patient,
                                   @PathVariable String consentId,
                                   @Valid @RequestBody AcceptConsentRequest request) {
        return service.accept(patient.subject(), consentId, request.signature());
    }

    @PostMapping("/{consentId}/revoke")
    @Operation(summary = "Revoke a consent (pending or previously granted)")
    public ConsentResponse revoke(@AuthenticationPrincipal ActorPrincipal patient, @PathVariable String consentId) {
        return service.revoke(patient.subject(), consentId);
    }
}
