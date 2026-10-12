import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  primary: "bg-brand-primary-50",
  success: "bg-brand-green-100",
  warning: "bg-brand-amber-100",
  neutral: "bg-brand-gray-200",
} as const;

const TONE_ICON_COLOR = {
  primary: "#025EAD",
  success: "#36743D",
  warning: "#F54900",
  neutral: "#5F738C",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: keyof typeof TONE_CLASSES;
}) {
  return (
    <Card className="flex-1">
      <CardContent className="flex-row items-center gap-3 py-3">
        <View className={cn("size-10 items-center justify-center rounded", TONE_CLASSES[tone])}>
          <Icon size={20} color={TONE_ICON_COLOR[tone]} />
        </View>
        <View>
          <Text className="font-sans-semibold text-xs text-brand-gray-600">{label}</Text>
          <Text className="font-sans-bold text-xl text-brand-gray-950">{value}</Text>
        </View>
      </CardContent>
    </Card>
  );
}
