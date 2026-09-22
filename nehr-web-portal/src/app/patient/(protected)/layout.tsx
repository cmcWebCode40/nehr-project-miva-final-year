"use client";

import { useEffect } from "react";
import { LayoutDashboard, FileCheck2, FileText, IdCard } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { useSession } from "@/lib/auth/useSession";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavItem } from "@/components/layout/nav-types";
import { usePatientKeys } from "../lib/PatientKeyContext";
import { getSelfCustodyIdentity } from "../lib/selfCustodyIdentity";

const navItems: NavItem[] = [
  { label: "Overview", href: "/patient/dashboard", icon: LayoutDashboard },
  { label: "Consents", href: "/patient/consents", icon: FileCheck2 },
  { label: "My Records", href: "/patient/records", icon: FileText },
  { label: "DID Lookup", href: "/patient/lookup", icon: IdCard },
];

/**
 * Recovers a self-custody patient's key material after a page refresh
 * (which resets the in-memory PatientKeyContext) by reloading it from the
 * same browser storage it was saved to at registration - no re-login
 * needed since the existing session token is still valid. Managed-custody
 * patients have no equivalent recovery: their keys only ever exist in
 * memory, re-derived from a password, so a refresh genuinely requires
 * signing in again.
 */
function useRecoverSelfCustodyKeys() {
  const { session } = useSession();
  const { keys, setKeys } = usePatientKeys();

  useEffect(() => {
    if (keys || !session || session.actorType !== "PATIENT") return;
    const identity = getSelfCustodyIdentity();
    if (identity && identity.did === session.subject) {
      setKeys({ ed25519PrivateKey: identity.ed25519PrivateKey, x25519PrivateKey: identity.x25519PrivateKey });
    }
  }, [keys, session, setKeys]);
}

export default function PatientProtectedLayout({ children }: { children: React.ReactNode }) {
  useRecoverSelfCustodyKeys();

  return (
    <RequireRole role="PATIENT">
      <DashboardShell navItems={navItems} roleLabel="Patient">
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
