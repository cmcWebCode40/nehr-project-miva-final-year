import { ActivityIndicator, Text, View } from "react-native";

/** The one loading treatment used everywhere, per the design brief's consistency rule. */
export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <View className="items-center justify-center gap-2 py-16">
      <ActivityIndicator size="small" color="#5F738C" />
      <Text className="text-sm text-brand-gray-600">{label}</Text>
    </View>
  );
}
