package ng.nehr.backend.common.web;

import org.springframework.http.HttpStatus;

public class NotFoundException extends NehrApiException {

    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
