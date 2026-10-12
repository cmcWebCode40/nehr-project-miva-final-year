import { Text, View } from "react-native";

export function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-sans-semibold text-sm text-brand-gray-800">{label}</Text>
      {children}
      {error ? (
        <Text className="font-sans-semibold text-xs text-brand-red-600">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-brand-gray-600">{hint}</Text>
      ) : null}
    </View>
  );
}
