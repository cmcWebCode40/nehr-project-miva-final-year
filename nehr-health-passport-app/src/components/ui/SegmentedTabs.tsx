import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";

export function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <View className="mb-6 flex-row rounded bg-secondary p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className={cn("flex-1 items-center rounded py-2", active && "bg-background")}
          >
            <Text className={cn("font-sans-semibold text-sm", active ? "text-foreground" : "text-brand-gray-650")}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
