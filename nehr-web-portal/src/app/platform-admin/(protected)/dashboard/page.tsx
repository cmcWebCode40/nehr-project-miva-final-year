"use client";

import Link from "next/link";
import { Building2, CheckCircle2, Clock, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { AuditTable } from "@/components/shared/AuditTable";
import { Button } from "@/components/ui/button";
import { useManageHospitals } from "../hospitals/hooks/useManageHospitals";
import { useAuditTrail } from "../audit/hooks/useAuditTrail";

export default function PlatformAdminDashboardPage() {
  const { hospitals } = useManageHospitals();
  const { entries, isLoading } = useAuditTrail();

  const pending = hospitals?.filter((h) => h.status === "PENDING").length ?? 0;
  const approved = hospitals?.filter((h) => h.status === "APPROVED").length ?? 0;

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Platform-wide status at a glance."
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/platform-admin/hospitals">
              <Building2 />
              Review hospitals
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Hospitals" value={hospitals?.length ?? 0} icon={Building2} tone="primary" />
        <StatCard label="Pending approval" value={pending} icon={Clock} tone="warning" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} tone="success" />
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
