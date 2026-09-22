"use client";

import { LayoutDashboard, FileCheck2, FileSignature, IdCard } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavItem } from "@/components/layout/nav-types";

const navItems: NavItem[] = [
  { label: "Overview", href: "/staff/dashboard", icon: LayoutDashboard },
  { label: "Consents", href: "/staff/consents", icon: FileCheck2 },
  { label: "Credentials", href: "/staff/credentials", icon: FileSignature },
  { label: "DID Lookup", href: "/staff/lookup", icon: IdCard },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="DOCTOR">
      <DashboardShell navItems={navItems} roleLabel="Health Staff">
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
