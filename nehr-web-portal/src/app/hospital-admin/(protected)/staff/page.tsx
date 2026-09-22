"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useManageStaff } from "./hooks/useManageStaff";
import { AddDoctorDialog } from "./components/AddDoctorDialog";
import type { DoctorSummary } from "./types";

export default function HospitalAdminStaffPage() {
  const { staff, isLoading } = useManageStaff();

  const columns: DataTableColumn<DoctorSummary>[] = [
    {
      key: "fullName",
      header: "Name",
      render: (row) => (
        <div>
          <p className="font-medium text-brand-gray-950">{row.fullName}</p>
          <p className="text-xs text-brand-gray-600">{row.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (row) => row.role },
    { key: "department", header: "Department", render: (row) => row.department ?? "-" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Doctors and clinicians authorized to act on this hospital's behalf."
        action={<AddDoctorDialog />}
      />
      <DataTable
        data={staff}
        isLoading={isLoading}
        columns={columns}
        rowKey={(row) => row.doctorDid}
        searchPlaceholder="Search by name or email..."
        getSearchableText={(row) => `${row.fullName} ${row.email} ${row.role}`}
        selectFilters={[
          {
            key: "status",
            label: "Status",
            accessor: (row) => row.status,
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "SUSPENDED", label: "Suspended" },
              { value: "REMOVED", label: "Removed" },
            ],
          },
        ]}
        emptyMessage="No staff added yet."
      />
    </div>
  );
}
