import { Text, View } from "react-native";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <View className="mb-6">
      <Text className="font-sans-bold text-xl text-brand-gray-950">{title}</Text>
      {description && <Text className="mt-1 text-sm text-brand-gray-650">{description}</Text>}
    </View>
  );
}
