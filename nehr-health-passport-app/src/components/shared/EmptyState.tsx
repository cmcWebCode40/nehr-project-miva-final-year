import { Text, View } from "react-native";
import { Inbox } from "lucide-react-native";

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <View className="items-center justify-center gap-2 rounded border border-dashed border-brand-gray-300 py-16">
      <Inbox size={24} color="#AAB7C6" />
      <Text className="font-sans-semibold text-sm text-brand-gray-700">{message}</Text>
      {hint && <Text className="max-w-[260px] text-center text-xs text-brand-gray-600">{hint}</Text>}
    </View>
  );
}
