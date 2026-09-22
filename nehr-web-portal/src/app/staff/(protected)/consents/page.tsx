"use client";

import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useConsents } from "./hooks/useConsents";
import { RequestConsentDialog } from "./components/RequestConsentDialog";
import type { ConsentSummary } from "./types";

export default function StaffConsentsPage() {
  const { consents, isLoading } = useConsents();

  const columns: DataTableColumn<ConsentSummary>[] = [
    {
      key: "grantorDid",
      header: "Patient",
      render: (row) => <code className="text-xs text-brand-gray-700">{row.grantorDid}</code>,
    },
    {
      key: "scope",
      header: "Scope",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.scope.map((type) => (
            <span
              key={type}
              className="rounded-[4px] bg-brand-gray-200 px-1.5 py-0.5 text-xs text-brand-gray-700"
            >
              {type}
            </span>
          ))}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "validUntil",
      header: "Valid until",
      render: (row) => (row.validUntil ? format(new Date(row.validUntil), "d MMM yyyy") : "No expiry"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Consents"
        description="Requests you've made for patient consent to view or issue records."
        action={<RequestConsentDialog />}
      />
      <DataTable
        data={consents}
        isLoading={isLoading}
        columns={columns}
        rowKey={(row) => row.consentId}
        searchPlaceholder="Search by patient DID..."
        getSearchableText={(row) => row.grantorDid}
        selectFilters={[
          {
            key: "status",
            label: "Status",
            accessor: (row) => row.status,
            options: [
              { value: "PENDING", label: "Pending" },
              { value: "GRANTED", label: "Granted" },
              { value: "REVOKED", label: "Revoked" },
              { value: "EXPIRED", label: "Expired" },
            ],
          },
        ]}
        emptyMessage="No consent requests yet."
      />
    </div>
  );
}
