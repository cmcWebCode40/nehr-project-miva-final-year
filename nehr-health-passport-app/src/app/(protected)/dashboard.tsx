import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useMyConsents } from "@/features/consents/hooks/useMyConsents";
import { useMyRecords } from "@/features/records/hooks/useMyRecords";
import { router } from "expo-router";
import { Clock, FileCheck2, FileText, IdCard } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { consents } = useMyConsents();
  const { records } = useMyRecords();

  const pending = consents?.filter((c) => c.status === "PENDING").length ?? 0;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-6 py-6" contentInsetAdjustmentBehavior="automatic">
        <PageHeader title="Overview" description="Your consent requests and records at a glance." />

        <View className="flex-row gap-3">
          <StatCard label="Pending" value={pending} icon={Clock} tone="warning" />
          <StatCard label="Consents" value={consents?.length ?? 0} icon={FileCheck2} tone="primary" />
          <StatCard label="Records" value={records?.length ?? 0} icon={FileText} tone="success" />
        </View>

        <View className="mt-6 gap-3">
          <Card>
            <CardContent className="items-start gap-2">
              <FileCheck2 size={20} color="#025EAD" />
              <Text className="font-sans-semibold text-sm text-brand-gray-950">Consent requests</Text>
              <Text className="text-xs text-brand-gray-600">Accept or decline hospital requests for access.</Text>
              <Button variant="outline" size="sm" onPress={() => router.push("/(protected)/consents")}>
                Go to Consents
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="items-start gap-2">
              <FileText size={20} color="#025EAD" />
              <Text className="font-sans-semibold text-sm text-brand-gray-950">My records</Text>
              <Text className="text-xs text-brand-gray-600">View every credential issued to you.</Text>
              <Button variant="outline" size="sm" onPress={() => router.push("/(protected)/records")}>
                Go to Records
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="items-start gap-2">
              <IdCard size={20} color="#025EAD" />
              <Text className="font-sans-semibold text-sm text-brand-gray-950">Look up a DID</Text>
              <Text className="text-xs text-brand-gray-600">Resolve any DID Document and verify its status.</Text>
              <Button variant="outline" size="sm" onPress={() => router.push("/(protected)/lookup")}>
                Go to Lookup
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
