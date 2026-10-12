import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "@/components/shared/PageHeader";
import { DidLookupPanel } from "@/components/shared/DidLookupPanel";
import { useSession } from "@/features/auth/useSession";

export default function LookupScreen() {
  const { session } = useSession();

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-6 py-6" contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <PageHeader title="DID Lookup" description="Resolve any DID's public document and status." />
        <DidLookupPanel ownDid={session?.subject} />
      </ScrollView>
    </SafeAreaView>
  );
}
