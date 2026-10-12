import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

export const Input = forwardRef<TextInput, TextInputProps>(function Input({ className, ...props }, ref) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor="#848F9F"
      className={cn(
        "h-11 rounded border border-input bg-background px-3 font-sans text-sm text-foreground",
        className
      )}
      {...props}
    />
  );
});
