"use client";

import { format } from "date-fns";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import type { AuditEntry } from "@/types/audit";

const ACTION_LABEL: Record<string, string> = {
  LOGIN_SUCCESS: "Login",
  HOSPITAL_REGISTERED: "Hospital registered",
  HOSPITAL_APPROVED: "Hospital approved",
  DOCTOR_ADDED: "Doctor added",
  CONSENT_REQUESTED: "Consent requested",
  CONSENT_GRANTED: "Consent granted",
  CONSENT_REVOKED: "Consent revoked",
  CREDENTIAL_ISSUED: "Credential issued",
};

/** Shared by platform-admin's (all entries) and hospital-admin's (scoped) audit views - identical shape, different endpoints. */
export function AuditTable({ data, isLoading }: { data: AuditEntry[] | undefined; isLoading: boolean }) {
  const columns: DataTableColumn<AuditEntry>[] = [
    {
      key: "action",
      header: "Event",
      render: (row) => (
        <span className="font-medium text-brand-gray-950">
          {ACTION_LABEL[row.action] ?? row.action}
        </span>
      ),
    },
    {
      key: "actorDid",
      header: "Actor",
      render: (row) => <code className="text-xs text-brand-gray-650">{row.actorDid ?? "-"}</code>,
    },
    {
      key: "target",
      header: "Target",
      render: (row) => (
        <div className="text-xs">
          {row.targetDid ? <code className="text-brand-gray-650">{row.targetDid}</code> : "-"}
          {row.targetType && <span className="ml-1.5 text-brand-gray-500">({row.targetType})</span>}
        </div>
      ),
    },
    {
      key: "occurredAt",
      header: "When",
      render: (row) => (
        <span className="text-xs text-brand-gray-600">
          {format(new Date(row.occurredAt), "d MMM yyyy, HH:mm")}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={columns}
      rowKey={(row) => String(row.entryId)}
      searchPlaceholder="Search by actor or target DID..."
      getSearchableText={(row) => `${row.actorDid ?? ""} ${row.targetDid ?? ""} ${row.action}`}
      selectFilters={[
        {
          key: "action",
          label: "Event",
          accessor: (row) => row.action,
          options: Object.entries(ACTION_LABEL).map(([value, label]) => ({ value, label })),
        },
      ]}
      emptyMessage="No activity recorded yet."
    />
  );
}
