package ng.nehr.backend.consent;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.consent.dto.ConsentResponse;
import ng.nehr.backend.consent.dto.RequestConsentRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors/me/consents")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Credentials", description = "Consent requests and Verifiable Credential issuance/verification")
public class ConsentDoctorController {

    private final ConsentService service;

    public ConsentDoctorController(ConsentService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Request patient consent for a scope of record types",
            description = "Doctor only. Creates a PENDING request the patient must sign to grant.")
    public ConsentResponse request(@AuthenticationPrincipal ActorPrincipal doctor,
                                    @Valid @RequestBody RequestConsentRequest request) {
        return service.requestConsent(doctor.hospitalDid(), doctor.subject(), request);
    }

    @GetMapping
    @Operation(summary = "List consent requests made by the authenticated hospital")
    public List<ConsentResponse> list(@AuthenticationPrincipal ActorPrincipal doctor) {
        return service.listForHospital(doctor.hospitalDid());
    }
}
