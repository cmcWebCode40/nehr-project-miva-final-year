package ng.nehr.backend.identity;

import ng.nehr.backend.common.web.NehrApiException;
import org.springframework.http.HttpStatus;

public class DidAlreadyExistsException extends NehrApiException {

    public DidAlreadyExistsException(String did) {
        super(HttpStatus.CONFLICT, "DID already registered: " + did);
    }
}
