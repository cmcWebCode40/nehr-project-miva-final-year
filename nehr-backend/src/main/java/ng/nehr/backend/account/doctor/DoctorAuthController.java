package ng.nehr.backend.account.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.account.doctor.dto.DoctorLoginRequest;
import ng.nehr.backend.common.security.dto.TokenPairResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/doctors")
@Tag(name = "Auth", description = "Registration and login for all actor types, plus DID challenge-response")
public class DoctorAuthController {

    private final DoctorAuthService service;

    public DoctorAuthController(DoctorAuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    @Operation(summary = "Doctor login (email + password)")
    public TokenPairResponse login(@Valid @RequestBody DoctorLoginRequest request) {
        return service.login(request);
    }
}
