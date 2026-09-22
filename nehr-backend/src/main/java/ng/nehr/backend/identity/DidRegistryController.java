package ng.nehr.backend.identity;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import ng.nehr.backend.identity.dto.DidResolutionResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dids")
@Tag(name = "DID Registry", description = "Public resolution of did:nehr Decentralized Identifiers")
public class DidRegistryController {

    private final DidRegistryService service;

    public DidRegistryController(DidRegistryService service) {
        this.service = service;
    }

    @GetMapping("/{did}")
    @Operation(summary = "Resolve a DID to its DID Document",
            description = "Public, unauthenticated. Returns a DID resolution result "
                    + "(document + metadata) per the W3C DID Resolution spec shape. "
                    + "Deactivated DIDs still resolve, with deactivated=true in the metadata.")
    public DidResolutionResult resolve(@PathVariable String did) {
        DidRegistry record = service.resolve(did).orElseThrow(() -> new DidNotFoundException(did));
        return DidResolutionResult.from(record);
    }
}
