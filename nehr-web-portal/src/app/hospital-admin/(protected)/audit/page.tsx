"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { AuditTable } from "@/components/shared/AuditTable";
import { useAuditTrail } from "./hooks/useAuditTrail";

export default function HospitalAdminAuditPage() {
  const { entries, isLoading } = useAuditTrail();

  return (
    <div>
      <PageHeader
        title="Audit Trail"
        description="Activity involving your hospital and its staff, newest first."
      />
      <AuditTable data={entries} isLoading={isLoading} />
    </div>
  );
}
