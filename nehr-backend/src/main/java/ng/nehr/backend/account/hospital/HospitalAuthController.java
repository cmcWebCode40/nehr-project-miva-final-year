package ng.nehr.backend.account.hospital;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.account.hospital.dto.HospitalLoginRequest;
import ng.nehr.backend.account.hospital.dto.HospitalRegistrationResponse;
import ng.nehr.backend.account.hospital.dto.RegisterHospitalRequest;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/hospitals")
@Tag(name = "Auth", description = "Registration and login for all actor types, plus DID challenge-response")
public class HospitalAuthController {

    private final HospitalAuthService service;

    public HospitalAuthController(HospitalAuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a hospital",
            description = "Institutional keys are generated in the hospital web app and submitted "
                    + "here (public and private) so the server can hold them, encrypted, for later "
                    + "VC signing. New hospitals start PENDING until a platform admin approves them.")
    public HospitalRegistrationResponse register(@Valid @RequestBody RegisterHospitalRequest request) {
        return service.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Hospital admin login (email + password)",
            description = "Fails with 403 while the hospital is PENDING or SUSPENDED.")
    public TokenPairResponse login(@Valid @RequestBody HospitalLoginRequest request) {
        return service.login(request);
    }
}
