package ng.nehr.backend.account.hospital;

import ng.nehr.backend.account.hospital.dto.HospitalSummaryResponse;
import ng.nehr.backend.audit.AuditAction;
import ng.nehr.backend.audit.AuditService;
import ng.nehr.backend.common.web.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class HospitalApprovalService {

    private final HospitalAccountRepository repository;
    private final AuditService auditService;

    public HospitalApprovalService(HospitalAccountRepository repository, AuditService auditService) {
        this.repository = repository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<HospitalSummaryResponse> list(Optional<HospitalStatus> status) {
        List<HospitalAccount> accounts = status.map(repository::findByStatus).orElseGet(repository::findAll);
        return accounts.stream().map(HospitalSummaryResponse::from).toList();
    }

    @Transactional
    public HospitalSummaryResponse approve(String hospitalDid, String approvedByAdminId) {
        HospitalAccount account = repository.findById(hospitalDid)
                .orElseThrow(() -> new NotFoundException("Hospital not found: " + hospitalDid));
        account.approve(approvedByAdminId);
        auditService.record(approvedByAdminId, AuditAction.HOSPITAL_APPROVED, hospitalDid, "HOSPITAL", null);
        return HospitalSummaryResponse.from(account);
    }
}
