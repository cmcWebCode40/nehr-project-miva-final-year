import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingState } from "@/components/shared/LoadingState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { findVcType } from "@/lib/vc-types";
import { useDecryptedRecord } from "../hooks/useMyRecords";

function humanizeKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function DecryptedRecordDialog({
  recordId,
  open,
  onOpenChange,
}: {
  recordId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, isError, error } = useDecryptedRecord(recordId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
        {isLoading ? (
          <div className="py-6">
            <LoadingState label="Decrypting record..." />
          </div>
        ) : isError || !data ? (
          <div className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-brand-amber-600" />
            <p className="text-sm text-brand-gray-700">
              {error instanceof Error ? error.message : "Could not decrypt this record."}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="pr-6">{data.vc.credentialSubject.resourceType}</DialogTitle>
            </DialogHeader>

            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-brand-gray-600">
                  Issued {format(new Date(data.vc.issuanceDate), "d MMM yyyy, HH:mm")} by{" "}
                  {data.vc.credentialSubject.recordedBy.fullName}
                </p>
                <StatusBadge status={data.detail.revoked ? "REVOKED" : "ACTIVE"} />
              </div>

              <div className="space-y-3 rounded-[4px] border border-input p-3">
                {Object.entries(data.vc.credentialSubject.content).map(([key, value]) => {
                  const field = findVcType(data.vc.credentialSubject.resourceType)?.fields.find(
                    (f) => f.name === key
                  );
                  return (
                    <div key={key} className="text-sm">
                      <p className="text-brand-gray-600">{field?.label.replace(" *", "") ?? humanizeKey(key)}</p>
                      <p className="mt-0.5 break-all font-medium text-brand-gray-950">{String(value)}</p>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-brand-gray-500">
                Signed by <code className="break-all">{data.vc.issuer}</code> with an Ed25519
                signature anyone can verify against that hospital&apos;s public DID Document.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
