package ng.nehr.backend.common.security;

import ng.nehr.backend.common.web.NehrApiException;
import org.springframework.http.HttpStatus;

public class TooManyRequestsException extends NehrApiException {

    public TooManyRequestsException() {
        super(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts - try again shortly");
    }
}
