package ng.nehr.backend.common.security;

public record ActorPrincipal(
        String subject,
        ActorType actorType,
        String hospitalDid,
        String role,
        String department,
        Integer tokenVersion) {

    public static ActorPrincipal patient(String did) {
        return new ActorPrincipal(did, ActorType.PATIENT, null, null, null, null);
    }

    public static ActorPrincipal hospitalAdmin(String hospitalDid) {
        return new ActorPrincipal(hospitalDid, ActorType.HOSPITAL_ADMIN, hospitalDid, null, null, null);
    }

    public static ActorPrincipal doctor(String doctorDid, String hospitalDid, String role,
                                        String department, int tokenVersion) {
        return new ActorPrincipal(doctorDid, ActorType.DOCTOR, hospitalDid, role, department, tokenVersion);
    }

    public static ActorPrincipal platformAdmin(String adminId) {
        return new ActorPrincipal(adminId, ActorType.PLATFORM_ADMIN, null, null, null, null);
    }
}
