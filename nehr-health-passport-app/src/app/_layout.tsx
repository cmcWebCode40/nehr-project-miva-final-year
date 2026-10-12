import "react-native-get-random-values";
import "../global.css";

import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { PatientKeyProvider } from "@/features/auth/PatientKeyContext";
import { AVERTA_FONTS } from "@/theme/fonts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts(AVERTA_FONTS);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PatientKeyProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(protected)" />
        </Stack>
      </PatientKeyProvider>
    </QueryClientProvider>
  );
}
