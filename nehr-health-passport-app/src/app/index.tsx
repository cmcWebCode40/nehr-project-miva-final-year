import { Redirect, Link } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/features/auth/useSession";

export default function WelcomeScreen() {
  const { session, hydrated } = useSession();

  if (!hydrated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <LoadingState label="Loading..." />
      </SafeAreaView>
    );
  }

  if (session) {
    return <Redirect href="/(protected)/dashboard" />;
  }

  return (
    <SafeAreaView className="flex-1 justify-between bg-background px-6 py-10">
      <StatusBar style="dark" />
      <View className="mt-16">
        <Text className="font-sans-extrabold text-4xl leading-tight text-brand-gray-950">
          Your health record,{"\n"}owned by you.
        </Text>
        <Text className="mt-4 text-base text-brand-gray-650">
          Accept consent requests from hospitals and view every credential issued to you - decrypted only on your
          own device.
        </Text>
      </View>

      <View className="gap-3">
        <Link href="/register" asChild>
          <Button size="lg">Create your patient account</Button>
        </Link>
        <Link href="/login" asChild>
          <Button variant="outline" size="lg">
            I already have an account
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}
