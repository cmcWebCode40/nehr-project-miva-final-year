import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { Check, Ban } from "lucide-react-native";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useMyConsents } from "@/features/consents/hooks/useMyConsents";

export default function ConsentsScreen() {
  const { consents, isLoading, isRefetching, refetch, canSign, acceptConsent, revokeConsent } = useMyConsents();

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-6 py-6"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <PageHeader
          title="Consent requests"
          description="Hospitals asking to issue or view records in a given scope - nothing is shared until you accept."
        />

        {!canSign && (
          <View className="mb-4 rounded bg-brand-amber-50 p-3">
            <Text className="text-xs text-brand-amber-700">
              Your signing key isn&apos;t loaded (this can happen after signing out of a managed-custody account).
              Sign in again to accept a request.
            </Text>
          </View>
        )}

        {isLoading ? (
          <LoadingState label="Loading consent requests..." />
        ) : !consents || consents.length === 0 ? (
          <EmptyState message="No consent requests yet" hint="Requests from hospitals will appear here." />
        ) : (
          <View className="gap-3">
            {consents.map((consent) => (
              <Card key={consent.consentId}>
                <CardContent>
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-sm text-brand-gray-950">
                        Hospital <Text className="font-mono text-xs">{consent.granteeDid}</Text>
                      </Text>
                      {consent.purpose && <Text className="text-xs text-brand-gray-600">{consent.purpose}</Text>}
                    </View>
                    <StatusBadge status={consent.status} />
                  </View>

                  <View className="flex-row flex-wrap gap-1">
                    {consent.scope.map((type) => (
                      <View key={type} className="rounded bg-brand-gray-200 px-1.5 py-0.5">
                        <Text className="text-xs text-brand-gray-700">{type}</Text>
                      </View>
                    ))}
                  </View>

                  <Text className="text-xs text-brand-gray-500">
                    {consent.validUntil ? `Valid until ${format(new Date(consent.validUntil), "d MMM yyyy")}` : "No expiry"}
                  </Text>

                  {consent.status === "PENDING" && (
                    <View className="flex-row gap-2 pt-1">
                      <Button
                        size="sm"
                        disabled={!canSign}
                        loading={acceptConsent.isPending}
                        icon={<Check size={14} color="#FFFFFF" />}
                        onPress={() => acceptConsent.mutate(consent)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        loading={revokeConsent.isPending}
                        icon={<Ban size={14} color="#353F50" />}
                        onPress={() => revokeConsent.mutate(consent.consentId)}
                      >
                        Decline
                      </Button>
                    </View>
                  )}

                  {consent.status === "GRANTED" && (
                    <View className="pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        loading={revokeConsent.isPending}
                        icon={<Ban size={14} color="#353F50" />}
                        onPress={() => revokeConsent.mutate(consent.consentId)}
                      >
                        Revoke access
                      </Button>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
