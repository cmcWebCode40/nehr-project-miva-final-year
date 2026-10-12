import { AuthHero } from "@/components/shared/AuthHero";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { usePatientRegister } from "@/features/auth/hooks/usePatientRegister";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Smartphone } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const managedSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ManagedFormValues = z.infer<typeof managedSchema>;

export default function PatientRegisterScreen() {
  const [mode, setMode] = useState<"self" | "managed">("self");
  const register = usePatientRegister();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ManagedFormValues>({ resolver: zodResolver(managedSchema) });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-6 py-8" keyboardShouldPersistTaps="handled">
          <AuthHero
            headline={["Your health record,", "owned by you."]}
            subtext="Create a patient identity, accept consent requests from hospitals, and view every credential issued to you - decrypted only on your own device."
          />

          <Text className="font-sans-bold text-2xl text-brand-gray-950">Create your patient account</Text>
          <Text className="mb-6 mt-1 text-sm text-brand-gray-650">Choose how you&apos;d like to hold your keys.</Text>

          <SegmentedTabs
            value={mode}
            onChange={setMode}
            options={[
              { value: "self", label: "This device" },
              { value: "managed", label: "Email & password" },
            ]}
          />

          {mode === "self" ? (
            <View className="gap-4">
              <View className="flex-row items-start gap-3 rounded bg-brand-primary-50 p-3">
                <Smartphone size={16} color="#025EAD" />
                <Text className="flex-1 text-xs text-brand-gray-700">
                  Your signing keys are generated and kept securely on this device only - no password, no
                  recovery. This is the app&apos;s self-custody mode.
                </Text>
              </View>
              <Button loading={register.isPending} onPress={() => register.mutate({ mode: "self" })}>
                Generate my identity
              </Button>
            </View>
          ) : (
            <View className="gap-4">
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FormField label="Email" error={errors.email?.message}>
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                  </FormField>
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FormField label="Password" error={errors.password?.message}>
                    <PasswordInput value={field.value} onChangeText={field.onChange} autoComplete="new-password" />
                  </FormField>
                )}
              />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormField label="Confirm password" error={errors.confirmPassword?.message}>
                    <PasswordInput value={field.value} onChangeText={field.onChange} autoComplete="new-password" />
                  </FormField>
                )}
              />
              <Button loading={register.isPending} onPress={handleSubmit((values) => register.mutate({ mode: "managed", ...values }))}>
                Create account
              </Button>
            </View>
          )}

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-sm text-brand-gray-650">Already have an account?</Text>
            <Link href="/login">
              <Text className="font-sans-semibold text-sm text-brand-primary-600">Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
