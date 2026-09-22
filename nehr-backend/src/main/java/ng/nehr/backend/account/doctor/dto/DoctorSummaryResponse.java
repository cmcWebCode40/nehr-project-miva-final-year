package ng.nehr.backend.account.doctor.dto;

import ng.nehr.backend.account.doctor.DoctorAccount;
import ng.nehr.backend.account.doctor.DoctorStatus;

public record DoctorSummaryResponse(
        String doctorDid,
        String fullName,
        String email,
        String role,
        String department,
        DoctorStatus status) {

    public static DoctorSummaryResponse from(DoctorAccount account) {
        return new DoctorSummaryResponse(
                account.getDoctorDid(),
                account.getFullName(),
                account.getEmail(),
                account.getRole(),
                account.getDepartment(),
                account.getStatus());
    }
}
