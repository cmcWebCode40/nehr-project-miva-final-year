package ng.nehr.backend.credentials.dto;

public record VerifyCredentialResponse(boolean valid, String issuerDid, String reason) {

    public static VerifyCredentialResponse valid(String issuerDid) {
        return new VerifyCredentialResponse(true, issuerDid, null);
    }

    public static VerifyCredentialResponse invalid(String issuerDid, String reason) {
        return new VerifyCredentialResponse(false, issuerDid, reason);
    }
}
