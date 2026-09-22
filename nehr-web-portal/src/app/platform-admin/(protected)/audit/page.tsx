"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { AuditTable } from "@/components/shared/AuditTable";
import { useAuditTrail } from "./hooks/useAuditTrail";

export default function PlatformAdminAuditPage() {
  const { entries, isLoading } = useAuditTrail();

  return (
    <div>
      <PageHeader title="Audit Trail" description="Platform-wide activity, newest first." />
      <AuditTable data={entries} isLoading={isLoading} />
    </div>
  );
}
