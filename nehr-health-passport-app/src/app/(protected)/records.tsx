import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMyRecords } from "@/features/records/hooks/useMyRecords";
import { RecordListItem } from "@/features/records/components/RecordListItem";
import { DecryptedRecordSheet } from "@/features/records/components/DecryptedRecordSheet";

export default function RecordsScreen() {
  const { records, isLoading, isRefetching, refetch, canDecrypt } = useMyRecords();
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-6 py-6"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <PageHeader
          title="My records"
          description="Every credential issued to you - encrypted for you alone, decrypted only on this device."
        />

        {!canDecrypt && (
          <View className="mb-4 rounded bg-brand-amber-50 p-3">
            <Text className="text-xs text-brand-amber-700">
              Your decryption key isn&apos;t loaded. Sign in again to view your records.
            </Text>
          </View>
        )}

        {isLoading ? (
          <LoadingState label="Loading records..." />
        ) : !records || records.length === 0 ? (
          <EmptyState message="No records yet" hint="Records issued to you by a hospital will appear here." />
        ) : (
          <View className="gap-2">
            {records.map((record) => (
              <RecordListItem key={record.recordId} record={record} onView={setViewingRecordId} />
            ))}
          </View>
        )}
      </ScrollView>

      <DecryptedRecordSheet
        recordId={viewingRecordId}
        open={!!viewingRecordId}
        onClose={() => setViewingRecordId(null)}
      />
    </SafeAreaView>
  );
}
