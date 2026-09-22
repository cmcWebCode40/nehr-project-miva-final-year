package ng.nehr.backend.common.web;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends NehrApiException {

    public ForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
