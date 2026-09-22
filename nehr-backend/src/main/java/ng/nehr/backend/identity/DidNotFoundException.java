package ng.nehr.backend.identity;

import ng.nehr.backend.common.web.NehrApiException;
import org.springframework.http.HttpStatus;

public class DidNotFoundException extends NehrApiException {

    public DidNotFoundException(String did) {
        super(HttpStatus.NOT_FOUND, "No DID found for: " + did);
    }
}
