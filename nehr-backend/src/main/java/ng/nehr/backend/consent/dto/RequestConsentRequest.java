package ng.nehr.backend.consent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record RequestConsentRequest(
        @NotBlank String patientDid,
        @NotEmpty List<String> scope,
        String purpose,
        @Positive Integer validityDays) {
}
