import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { format } from "date-fns";
import { AlertTriangle, Eye } from "lucide-react-native";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
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
    <Card>
      <CardContent className="flex-row items-center justify-between gap-3 py-3">
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#5F738C" />
              <Text className="text-sm text-brand-gray-600">Decrypting...</Text>
            </View>
          ) : isError ? (
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={14} color="#F54900" />
              <Text className="text-sm text-brand-gray-600">Couldn&apos;t decrypt (legacy record)</Text>
            </View>
          ) : (
            <Text className="font-sans-semibold text-sm text-brand-gray-950" numberOfLines={1}>
              {title}
            </Text>
          )}
          <Text className="mt-1 text-xs text-brand-gray-500">{format(new Date(record.createdAt), "d MMM yyyy, HH:mm")}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <StatusBadge status={record.revoked ? "REVOKED" : "ACTIVE"} />
          <Pressable
            accessibilityRole="button"
            disabled={isLoading || isError}
            onPress={() => onView(record.recordId)}
            className={`flex-row items-center gap-1 rounded border border-input px-2.5 py-1.5 ${isLoading || isError ? "opacity-50" : ""}`}
          >
            <Eye size={14} color="#353F50" />
            <Text className="font-sans-semibold text-xs text-brand-gray-900">View</Text>
          </Pressable>
        </View>
      </CardContent>
    </Card>
  );
}
