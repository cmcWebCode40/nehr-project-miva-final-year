package ng.nehr.backend.common.web;

import org.springframework.http.HttpStatus;

public class ConflictException extends NehrApiException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
