package ng.nehr.backend.account.doctor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * {@code adminPassword} re-authenticates the requesting hospital admin for
 * this sensitive action: it is needed transiently to unwrap the hospital's
 * DEK (via the admin's own {@code hospital_key_grants} entry) so a new
 * grant can be wrapped for the doctor - it is never stored.
 * {@code defaultPassword} becomes the doctor's own login password
 * immediately; there is no forced change-password-on-first-login flow yet
 * (see TECH_DEBT.md).
 */
public record CreateDoctorRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank String role,
        String department,
        String licenceNumber,
        @NotBlank @Size(min = 8) String defaultPassword,
        @NotBlank String adminPassword) {
}
