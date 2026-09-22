package ng.nehr.backend.account.doctor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DoctorLoginRequest(@NotBlank @Email String email, @NotBlank String password) {
}
