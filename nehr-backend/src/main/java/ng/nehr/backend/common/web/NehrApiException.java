package ng.nehr.backend.common.web;

import org.springframework.http.HttpStatus;

public abstract class NehrApiException extends RuntimeException {

    private final HttpStatus status;

    protected NehrApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus status() {
        return status;
    }
}
