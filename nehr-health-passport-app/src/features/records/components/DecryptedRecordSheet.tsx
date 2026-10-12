import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { format } from "date-fns";
import { AlertTriangle, X } from "lucide-react-native";
import { LoadingState } from "@/components/shared/LoadingState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { findVcType } from "@/lib/vc-types";
import { useDecryptedRecord } from "../hooks/useMyRecords";

function humanizeKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function DecryptedRecordSheet({
  recordId,
  open,
  onClose,
}: {
  recordId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading, isError, error } = useDecryptedRecord(recordId);

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[85%] rounded-t-2xl bg-background p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-sans-bold text-lg text-brand-gray-950" numberOfLines={1}>
              {isLoading ? "Loading..." : data?.vc.credentialSubject.resourceType ?? "Record"}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8}>
              <X size={20} color="#5F738C" />
            </Pressable>
          </View>

          {isLoading ? (
            <LoadingState label="Decrypting record..." />
          ) : isError || !data ? (
            <View className="flex-row items-start gap-3 py-4">
              <AlertTriangle size={16} color="#F54900" />
              <Text className="flex-1 text-sm text-brand-gray-700">
                {error instanceof Error ? error.message : "Could not decrypt this record."}
              </Text>
            </View>
          ) : (
            <ScrollView className="gap-4">
              <View className="mb-4 flex-row flex-wrap items-center justify-between gap-2">
                <Text className="text-xs text-brand-gray-600">
                  Issued {format(new Date(data.vc.issuanceDate), "d MMM yyyy, HH:mm")} by{" "}
                  {data.vc.credentialSubject.recordedBy.fullName}
                </Text>
                <StatusBadge status={data.detail.revoked ? "REVOKED" : "ACTIVE"} />
              </View>

              <View className="gap-3 rounded border border-input p-3">
                {Object.entries(data.vc.credentialSubject.content).map(([key, value]) => {
                  const field = findVcType(data.vc.credentialSubject.resourceType)?.fields.find(
                    (f) => f.name === key
                  );
                  return (
                    <View key={key}>
                      <Text className="text-sm text-brand-gray-600">{field?.label.replace(" *", "") ?? humanizeKey(key)}</Text>
                      <Text className="mt-0.5 font-sans-semibold text-sm text-brand-gray-950">{String(value)}</Text>
                    </View>
                  );
                })}
              </View>

              <Text className="mt-4 text-xs text-brand-gray-500">
                Signed by {data.vc.issuer} with an Ed25519 signature anyone can verify against that hospital&apos;s
                public DID Document.
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
