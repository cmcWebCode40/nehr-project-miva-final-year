package ng.nehr.backend.common.web;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends NehrApiException {

    public UnauthorizedException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
