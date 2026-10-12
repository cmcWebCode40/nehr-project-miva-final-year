export type ActorType = "PATIENT" | "HOSPITAL_ADMIN" | "DOCTOR" | "PLATFORM_ADMIN";

export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface Session extends TokenPairResponse {
  actorType: ActorType;
  subject: string;
  hospitalDid?: string;
}
