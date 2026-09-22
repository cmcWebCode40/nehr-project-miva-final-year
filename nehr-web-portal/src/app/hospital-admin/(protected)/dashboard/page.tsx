"use client";

import Link from "next/link";
import { ScrollText, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { AuditTable } from "@/components/shared/AuditTable";
import { Button } from "@/components/ui/button";
import { useManageStaff } from "../staff/hooks/useManageStaff";
import { useAuditTrail } from "../audit/hooks/useAuditTrail";

export default function HospitalAdminDashboardPage() {
  const { staff } = useManageStaff();
  const { entries, isLoading } = useAuditTrail();

  const active = staff?.filter((doctor) => doctor.status === "ACTIVE").length ?? 0;

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Your hospital's status at a glance."
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/hospital-admin/staff">
              <Users />
              Manage staff
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total staff" value={staff?.length ?? 0} icon={Users} tone="primary" />
        <StatCard label="Active staff" value={active} icon={UserCheck} tone="success" />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-gray-800">
          <ScrollText className="size-4" />
          Recent activity
        </h2>
        <AuditTable data={entries?.slice(0, 8)} isLoading={isLoading} />
      </div>
    </div>
  );
}
