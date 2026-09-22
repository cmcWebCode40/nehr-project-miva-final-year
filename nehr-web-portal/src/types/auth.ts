export type ActorType = "PATIENT" | "HOSPITAL_ADMIN" | "DOCTOR" | "PLATFORM_ADMIN";

export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface Session extends TokenPairResponse {
  actorType: ActorType;
  /** DID for hospital admin/doctor, numeric id-as-string for platform admin - whatever /login returned as the identity. */
  subject: string;
  hospitalDid?: string;
}
