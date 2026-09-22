"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMyRecords } from "./hooks/useMyRecords";
import { RecordListItem } from "./components/RecordListItem";
import { DecryptedRecordDialog } from "./components/DecryptedRecordDialog";

export default function PatientRecordsPage() {
  const { records, isLoading, canDecrypt } = useMyRecords();
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="My records"
        description="Every credential issued to you - encrypted for you alone, decrypted only in this browser."
      />

      {!canDecrypt && (
        <div className="mb-4 rounded-[4px] bg-brand-amber-50 p-3 text-xs text-brand-amber-700">
          Your decryption key isn&apos;t loaded in this tab. Sign in again to view your records.
        </div>
      )}

      {isLoading ? (
        <LoadingState label="Loading records..." />
      ) : !records || records.length === 0 ? (
        <EmptyState message="No records yet" hint="Records issued to you by a hospital will appear here." />
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <RecordListItem key={record.recordId} record={record} onView={setViewingRecordId} />
          ))}
        </div>
      )}

      <DecryptedRecordDialog
        recordId={viewingRecordId}
        open={!!viewingRecordId}
        onOpenChange={(open) => !open && setViewingRecordId(null)}
      />
    </div>
  );
}
