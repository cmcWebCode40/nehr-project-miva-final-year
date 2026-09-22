package ng.nehr.backend.audit;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import ng.nehr.backend.account.doctor.DoctorAccountRepository;
import ng.nehr.backend.audit.dto.AuditEntryResponse;
import ng.nehr.backend.common.security.ActorPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hospitals/me/audit-trail")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Auth", description = "Registration and login for all actor types, plus DID challenge-response")
public class HospitalAuditController {

    private final AuditService auditService;
    private final DoctorAccountRepository doctorAccountRepository;

    public HospitalAuditController(AuditService auditService, DoctorAccountRepository doctorAccountRepository) {
        this.auditService = auditService;
        this.doctorAccountRepository = doctorAccountRepository;
    }

    @GetMapping
    @Operation(summary = "List audit entries involving the authenticated hospital or its doctors",
            description = "Hospital admin only. Newest first. Covers registration/approval, "
                    + "doctor management, consent requests/grants, and credential issuance.")
    public List<AuditEntryResponse> list(@AuthenticationPrincipal ActorPrincipal admin,
                                          @RequestParam(defaultValue = "50") int limit) {
        List<String> dids = new ArrayList<>();
        dids.add(admin.hospitalDid());
        doctorAccountRepository.findByHospitalDid(admin.hospitalDid())
                .forEach(doctor -> dids.add(doctor.getDoctorDid()));
        return auditService.listInvolving(dids, limit).map(AuditEntryResponse::from).getContent();
    }
}
