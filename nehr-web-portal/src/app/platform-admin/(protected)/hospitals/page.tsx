"use client";

import { Check } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useManageHospitals } from "./hooks/useManageHospitals";
import type { HospitalSummary } from "./types";

export default function PlatformAdminHospitalsPage() {
  const { hospitals, isLoading, approve, approvingId } = useManageHospitals();

  const columns: DataTableColumn<HospitalSummary>[] = [
    {
      key: "hospitalName",
      header: "Hospital",
      render: (row) => (
        <div>
          <p className="font-medium text-brand-gray-950">{row.hospitalName}</p>
          <p className="text-xs text-brand-gray-600">{row.email}</p>
        </div>
      ),
    },
    {
      key: "hospitalDid",
      header: "DID",
      render: (row) => (
        <code className="text-xs text-brand-gray-650">{row.hospitalDid}</code>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) =>
        row.status === "PENDING" ? (
          <Button
            size="sm"
            loading={approvingId === row.hospitalDid}
            onClick={() => approve(row.hospitalDid)}
          >
            <Check />
            Approve
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Hospitals"
        description="Review and approve hospitals registered on the platform."
      />
      <DataTable
        data={hospitals}
        isLoading={isLoading}
        columns={columns}
        rowKey={(row) => row.hospitalDid}
        searchPlaceholder="Search by hospital name or email..."
        getSearchableText={(row) => `${row.hospitalName} ${row.email}`}
        selectFilters={[
          {
            key: "status",
            label: "Status",
            accessor: (row) => row.status,
            options: [
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "SUSPENDED", label: "Suspended" },
            ],
          },
        ]}
        emptyMessage="No hospitals have registered yet."
      />
    </div>
  );
}
