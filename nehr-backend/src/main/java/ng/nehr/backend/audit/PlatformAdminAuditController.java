package ng.nehr.backend.audit;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import ng.nehr.backend.audit.dto.AuditEntryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/platform-admin/audit-trail")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Auth", description = "Registration and login for all actor types, plus DID challenge-response")
public class PlatformAdminAuditController {

    private final AuditService auditService;

    public PlatformAdminAuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "List the most recent audit entries platform-wide",
            description = "Platform admin only. Newest first.")
    public List<AuditEntryResponse> list(@RequestParam(defaultValue = "50") int limit) {
        return auditService.listAll(limit).map(AuditEntryResponse::from).getContent();
    }
}
