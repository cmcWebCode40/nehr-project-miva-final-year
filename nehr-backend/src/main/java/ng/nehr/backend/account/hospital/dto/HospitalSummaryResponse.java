package ng.nehr.backend.account.hospital.dto;

import ng.nehr.backend.account.hospital.HospitalAccount;
import ng.nehr.backend.account.hospital.HospitalStatus;

import java.time.Instant;

public record HospitalSummaryResponse(
        String hospitalDid,
        String hospitalName,
        String email,
        HospitalStatus status,
        Instant approvedAt,
        String approvedBy) {

    public static HospitalSummaryResponse from(HospitalAccount account) {
        return new HospitalSummaryResponse(
                account.getHospitalDid(),
                account.getHospitalName(),
                account.getEmail(),
                account.getStatus(),
                account.getApprovedAt(),
                account.getApprovedBy());
    }
}
