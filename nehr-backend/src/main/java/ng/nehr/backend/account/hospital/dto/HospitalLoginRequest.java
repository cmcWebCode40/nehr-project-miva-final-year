package ng.nehr.backend.account.hospital.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record HospitalLoginRequest(@NotBlank @Email String email, @NotBlank String password) {
}
