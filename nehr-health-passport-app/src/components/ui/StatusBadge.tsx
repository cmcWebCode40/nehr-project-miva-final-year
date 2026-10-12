import { Text, View } from "react-native";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  neutral: "bg-brand-gray-200",
  warning: "bg-brand-amber-100",
  success: "bg-brand-green-100",
  danger: "bg-brand-red-50",
} as const;

const TONE_TEXT_CLASSES = {
  neutral: "text-brand-gray-800",
  warning: "text-brand-amber-600",
  success: "text-brand-green-700",
  danger: "text-brand-red-600",
} as const;

type Tone = keyof typeof TONE_CLASSES;

const STATUS_TONE: Record<string, Tone> = {
  PENDING: "warning",
  ACTIVE: "success",
  GRANTED: "success",
  REVOKED: "danger",
  EXPIRED: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <View className={cn("rounded px-2 py-0.5", TONE_CLASSES[tone])}>
      <Text className={cn("font-sans-bold text-[10px] uppercase tracking-wide", TONE_TEXT_CLASSES[tone])}>
        {status}
      </Text>
    </View>
  );
}
