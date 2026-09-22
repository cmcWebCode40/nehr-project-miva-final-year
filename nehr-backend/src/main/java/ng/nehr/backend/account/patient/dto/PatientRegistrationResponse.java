package ng.nehr.backend.account.patient.dto;

import ng.nehr.backend.account.patient.CustodyType;

public record PatientRegistrationResponse(String did, CustodyType custodyType) {
}
