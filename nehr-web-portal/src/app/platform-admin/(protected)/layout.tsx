"use client";

import { LayoutDashboard, Building2, ScrollText } from "lucide-react";
import { RequireRole } from "@/lib/auth/RequireRole";
import { DashboardShell } from "@/components/layout/DashboardShell";
import type { NavItem } from "@/components/layout/nav-types";

const navItems: NavItem[] = [
  { label: "Overview", href: "/platform-admin/dashboard", icon: LayoutDashboard },
  { label: "Hospitals", href: "/platform-admin/hospitals", icon: Building2 },
  { label: "Audit Trail", href: "/platform-admin/audit", icon: ScrollText },
];

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="PLATFORM_ADMIN">
      <DashboardShell navItems={navItems} roleLabel="Platform Admin">
        {children}
      </DashboardShell>
    </RequireRole>
  );
}
