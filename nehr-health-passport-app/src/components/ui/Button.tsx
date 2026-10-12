import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "secondary" | "destructive" | "ghost";
type Size = "default" | "sm" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  default: "bg-primary active:bg-brand-primary-600",
  outline: "border border-input bg-background active:bg-secondary",
  secondary: "bg-secondary active:bg-brand-gray-250",
  destructive: "bg-brand-red-50 active:bg-brand-red-100",
  ghost: "active:bg-secondary",
};

const VARIANT_TEXT_CLASSES: Record<Variant, string> = {
  default: "text-primary-foreground font-sans-semibold",
  outline: "text-foreground font-sans-semibold",
  secondary: "text-secondary-foreground font-sans-semibold",
  destructive: "text-brand-red-600 font-sans-semibold",
  ghost: "text-foreground font-sans-semibold",
};

const SIZE_CLASSES: Record<Size, string> = {
  default: "h-11 px-4",
  sm: "h-9 px-3",
  lg: "h-12 px-5",
};

const SIZE_TEXT_CLASSES: Record<Size, string> = {
  default: "text-sm",
  sm: "text-xs",
  lg: "text-base",
};

export function Button({
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  className,
  textClassName,
  children,
  icon,
  ...props
}: PressableProps & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "default" ? "#FFFFFF" : "#0275D8"} />
      ) : (
        icon
      )}
      <Text className={cn(VARIANT_TEXT_CLASSES[variant], SIZE_TEXT_CLASSES[size], textClassName)}>{children}</Text>
    </Pressable>
  );
}
