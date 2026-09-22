"use client";

import { LayoutDashboard, Users, ScrollText } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavItem } from "@/components/layout/nav-types";

const navItems: NavItem[] = [
  { label: "Overview", href: "/hospital-admin/dashboard", icon: LayoutDashboard },
  { label: "Staff", href: "/hospital-admin/staff", icon: Users },
  { label: "Audit Trail", href: "/hospital-admin/audit", icon: ScrollText },
];

export default function HospitalAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="HOSPITAL_ADMIN">
      <DashboardShell navItems={navItems} roleLabel="Health Admin">
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
