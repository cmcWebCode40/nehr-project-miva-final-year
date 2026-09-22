package ng.nehr.backend.credentials;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import ng.nehr.backend.common.security.ActorPrincipal;
import ng.nehr.backend.credentials.dto.PatientRecordDetail;
import ng.nehr.backend.credentials.dto.PatientRecordSummary;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients/me/records")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Credentials", description = "Consent requests and Verifiable Credential issuance/verification")
public class PatientRecordsController {

    private final PatientRecordsService service;

    public PatientRecordsController(PatientRecordsService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List the authenticated patient's own records (metadata only)")
    public List<PatientRecordSummary> list(@AuthenticationPrincipal ActorPrincipal patient) {
        return service.listMine(patient.subject());
    }

    @GetMapping("/{recordId}")
    @Operation(summary = "Fetch one of the authenticated patient's own records",
            description = "Returns ciphertext + nonce for client-side decryption via X25519 "
                    + "agreement with the issuer's public key - the server cannot decrypt this itself.")
    public PatientRecordDetail get(@AuthenticationPrincipal ActorPrincipal patient, @PathVariable String recordId) {
        return service.getMine(patient.subject(), recordId);
    }
}
