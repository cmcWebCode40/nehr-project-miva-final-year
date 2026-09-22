package ng.nehr.backend.account.hospital.dto;

import ng.nehr.backend.account.hospital.HospitalStatus;

public record HospitalRegistrationResponse(String hospitalDid, HospitalStatus status) {
}
