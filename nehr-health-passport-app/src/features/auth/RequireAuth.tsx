import { useEffect } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "./useSession";

/**
 * Client-side route guard, ported from the web portal's `RequireRole` -
 * simplified to one actor type since this app is patient-only. Not a
 * server-verified check: the backend is the real authorization boundary,
 * this just keeps an unauthenticated user off the protected screens.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, hydrated } = useSession();

  useEffect(() => {
    if (!hydrated) return;
    if (!session) router.replace("/login");
  }, [hydrated, session]);

  if (!hydrated || !session) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <LoadingState label="Loading your account..." />
      </View>
    );
  }

  return <>{children}</>;
}
