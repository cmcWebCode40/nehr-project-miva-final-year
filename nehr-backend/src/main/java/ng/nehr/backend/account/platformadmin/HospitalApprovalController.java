package ng.nehr.backend.account.platformadmin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import ng.nehr.backend.account.hospital.HospitalApprovalService;
import ng.nehr.backend.account.hospital.HospitalStatus;
import ng.nehr.backend.account.hospital.dto.HospitalSummaryResponse;
import ng.nehr.backend.common.security.ActorPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/platform-admin/hospitals")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Auth", description = "Registration and login for all actor types, plus DID challenge-response")
public class HospitalApprovalController {

    private final HospitalApprovalService service;

    public HospitalApprovalController(HospitalApprovalService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List hospitals, optionally filtered by status", description = "Platform admin only.")
    public List<HospitalSummaryResponse> list(@RequestParam(required = false) HospitalStatus status) {
        return service.list(Optional.ofNullable(status));
    }

    @PostMapping("/{hospitalDid}/approve")
    @Operation(summary = "Approve a pending hospital registration", description = "Platform admin only.")
    public HospitalSummaryResponse approve(@AuthenticationPrincipal ActorPrincipal admin,
                                            @PathVariable String hospitalDid) {
        return service.approve(hospitalDid, admin.subject());
    }
}
