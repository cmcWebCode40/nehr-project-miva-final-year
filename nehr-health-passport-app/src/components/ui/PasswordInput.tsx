import { forwardRef, useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { cn } from "@/lib/utils";

export const PasswordInput = forwardRef<TextInput, TextInputProps>(function PasswordInput(
  { className, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="relative justify-center">
      <TextInput
        ref={ref}
        secureTextEntry={!visible}
        placeholderTextColor="#848F9F"
        className={cn(
          "h-11 rounded border border-input bg-background pl-3 pr-11 font-sans text-sm text-foreground",
          className
        )}
        {...props}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        onPress={() => setVisible((v) => !v)}
        className="absolute right-3"
        hitSlop={8}
      >
        {visible ? <EyeOff size={18} color="#848F9F" /> : <Eye size={18} color="#848F9F" />}
      </Pressable>
    </View>
  );
});
