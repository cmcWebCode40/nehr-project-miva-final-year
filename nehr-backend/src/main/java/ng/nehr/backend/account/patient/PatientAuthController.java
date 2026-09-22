package ng.nehr.backend.account.patient;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.account.patient.dto.PatientLoginRequest;
import ng.nehr.backend.account.patient.dto.PatientLoginResponse;
import ng.nehr.backend.account.patient.dto.PatientRegistrationResponse;
import ng.nehr.backend.account.patient.dto.RegisterManagedCustodyPatientRequest;
import ng.nehr.backend.account.patient.dto.RegisterSelfCustodyPatientRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/patients")
@Tag(name = "Auth", description = "Registration and login for all actor types, plus DID challenge-response")
public class PatientAuthController {

    private final PatientAuthService service;

    public PatientAuthController(PatientAuthService service) {
        this.service = service;
    }

    @PostMapping("/register/self-custody")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a self-custody patient",
            description = "Keys are generated on-device; only the public keys are submitted here.")
    public PatientRegistrationResponse registerSelfCustody(
            @Valid @RequestBody RegisterSelfCustodyPatientRequest request) {
        return service.registerSelfCustody(request);
    }

    @PostMapping("/register/managed-custody")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a managed-custody patient",
            description = "Keys are still generated and encrypted on-device; the server only "
                    + "ever stores the resulting ciphertext, returned again on login.")
    public PatientRegistrationResponse registerManagedCustody(
            @Valid @RequestBody RegisterManagedCustodyPatientRequest request) {
        return service.registerManagedCustody(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Managed-custody patient login (email + password)",
            description = "Self-custody patients authenticate via /api/v1/auth/challenge "
                    + "and /api/v1/auth/verify instead.")
    public PatientLoginResponse login(@Valid @RequestBody PatientLoginRequest request) {
        return service.login(request);
    }
}
