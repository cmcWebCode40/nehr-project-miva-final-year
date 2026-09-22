import type { ActorType, Session, TokenPairResponse } from "@/types/auth";
import { decodeAccessToken } from "./jwt";

type SessionArea = "platform-admin" | "hospital-admin" | "staff" | "patient";

/**
 * Sessions are namespaced by which portal area the browser is currently
 * in (from the URL path), not one global key - otherwise logging in as a
 * patient in one tab silently overwrites a hospital staff session open in
 * another tab of the same browser, since both would share one
 * `localStorage` key. The whole point of the patient portal is to be
 * usable side-by-side with a staff tab for a real two-actor test.
 */
function currentArea(): SessionArea | null {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  if (path.startsWith("/platform-admin")) return "platform-admin";
  if (path.startsWith("/hospital-admin")) return "hospital-admin";
  if (path.startsWith("/staff")) return "staff";
  if (path.startsWith("/patient")) return "patient";
  return null;
}

function sessionKey(area: SessionArea): string {
  return `nehr.session.${area}`;
}

export function buildSession(tokens: TokenPairResponse): Session {
  const claims = decodeAccessToken(tokens.accessToken);
  return {
    ...tokens,
    actorType: claims.actor_type,
    subject: claims.sub,
    hospitalDid: claims.hospital_did,
  };
}

export function getSession(): Session | null {
  const area = currentArea();
  if (!area) return null;
  const raw = window.localStorage.getItem(sessionKey(area));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  const area = currentArea();
  if (!area) return;
  window.localStorage.setItem(sessionKey(area), JSON.stringify(session));
}

export function clearSession(): void {
  const area = currentArea();
  if (!area) return;
  window.localStorage.removeItem(sessionKey(area));
}

export function loginPathFor(actorType: ActorType): string {
  switch (actorType) {
    case "PLATFORM_ADMIN":
      return "/platform-admin/login";
    case "HOSPITAL_ADMIN":
      return "/hospital-admin/login";
    case "DOCTOR":
      return "/staff/login";
    case "PATIENT":
      return "/patient/login";
    default:
      return "/";
  }
}

export function dashboardPathFor(actorType: ActorType): string {
  switch (actorType) {
    case "PLATFORM_ADMIN":
      return "/platform-admin/dashboard";
    case "HOSPITAL_ADMIN":
      return "/hospital-admin/dashboard";
    case "DOCTOR":
      return "/staff/dashboard";
    case "PATIENT":
      return "/patient/dashboard";
    default:
      return "/";
  }
}
