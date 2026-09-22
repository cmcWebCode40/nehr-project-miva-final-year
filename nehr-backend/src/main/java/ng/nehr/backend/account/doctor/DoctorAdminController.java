package ng.nehr.backend.account.doctor;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import ng.nehr.backend.account.doctor.dto.CreateDoctorRequest;
import ng.nehr.backend.account.doctor.dto.DoctorSummaryResponse;
import ng.nehr.backend.common.security.ActorPrincipal;
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
@RequestMapping("/api/v1/hospitals/me/doctors")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Auth", description = "Registration and login for all actor types, plus DID challenge-response")
public class DoctorAdminController {

    private final DoctorProvisioningService service;

    public DoctorAdminController(DoctorProvisioningService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a doctor to the authenticated hospital",
            description = "Hospital admin only. adminPassword re-authenticates this sensitive "
                    + "action and is used only to unwrap the hospital's shared key long enough "
                    + "to grant the new doctor access to it - it is never stored. The doctor can "
                    + "log in immediately with defaultPassword (no forced reset yet).")
    public DoctorSummaryResponse createDoctor(@AuthenticationPrincipal ActorPrincipal admin,
                                               @Valid @RequestBody CreateDoctorRequest request) {
        return service.createDoctor(admin.hospitalDid(), request);
    }

    @GetMapping
    @Operation(summary = "List doctors at the authenticated hospital")
    public List<DoctorSummaryResponse> listDoctors(@AuthenticationPrincipal ActorPrincipal admin) {
        return service.listDoctors(admin.hospitalDid());
    }
}
