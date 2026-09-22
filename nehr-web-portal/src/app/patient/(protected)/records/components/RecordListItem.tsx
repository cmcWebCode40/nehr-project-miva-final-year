import { format } from "date-fns";
import { AlertTriangle, Eye, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDecryptedRecord } from "../hooks/useMyRecords";
import type { RecordSummary } from "../types";

/** Decrypts on mount so the list shows a real title (e.g. "Malaria Test Result") instead of a bare record id. */
export function RecordListItem({
  record,
  onView,
}: {
  record: RecordSummary;
  onView: (recordId: string) => void;
}) {
  const { data, isLoading, isError } = useDecryptedRecord(record.recordId);
  const title = data?.vc.credentialSubject.resourceType ?? record.recordType;

  return (
    <Card className="rounded-[4px] shadow-none">
      <CardContent className="flex items-center justify-between gap-3 py-3">
        <div className="min-w-0">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-brand-gray-600">
              <Loader2 className="size-3.5 animate-spin" />
              Decrypting...
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-sm text-brand-gray-600">
              <AlertTriangle className="size-3.5 text-brand-amber-600" />
              Couldn&apos;t decrypt (legacy record)
            </div>
          ) : (
            <p className="truncate text-sm font-semibold text-brand-gray-950">{title}</p>
          )}
          <p className="mt-1 text-xs text-brand-gray-500">
            {format(new Date(record.createdAt), "d MMM yyyy, HH:mm")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={record.revoked ? "REVOKED" : "ACTIVE"} />
          <Button size="sm" variant="outline" disabled={isLoading || isError} onClick={() => onView(record.recordId)}>
            <Eye />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
