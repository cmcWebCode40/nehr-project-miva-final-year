import { AuthHero } from "@/components/shared/AuthHero";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { usePatientLogin } from "@/features/auth/hooks/usePatientLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Smartphone } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function PatientLoginScreen() {
  const { managedLogin, selfCustodyLogin, storedIdentity, checkingDevice } = usePatientLogin();
  // Defaults to "self" while `storedIdentity` is still loading, then to
  // whichever tab actually has something to show - but only until the
  // user taps a tab themselves, after which their choice sticks even if
  // that recompute would otherwise have picked the other one.
  const [mode, setMode] = useState<"self" | "managed">("self");
  const [userPickedMode, setUserPickedMode] = useState(false);
  const displayMode = userPickedMode ? mode : checkingDevice || storedIdentity ? "self" : "managed";
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });


  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerClassName="px-6 py-8" keyboardShouldPersistTaps="handled">
          <AuthHero
            headline={["Your health record,", "owned by you."]}
            subtext="Accept consent requests from hospitals and view every credential issued to you - decrypted only on your own device."
          />

          <Text className="font-sans-bold text-2xl text-brand-gray-950">Patient</Text>
          <Text className="mb-6 mt-1 text-sm text-brand-gray-650">Sign in to your NEHR patient account.</Text>

          <SegmentedTabs
            value={displayMode}
            onChange={(value) => {
              setUserPickedMode(true);
              setMode(value);
            }}
            options={[
              { value: "self", label: "This device" },
              { value: "managed", label: "Email & password" },
            ]}
          />

          {displayMode === "self" ? (
            storedIdentity ? (
              <View className="gap-4">
                <View className="flex-row items-start gap-3 rounded bg-brand-primary-50 p-3">
                  <Smartphone size={16} color="#025EAD" />
                  <Text className="flex-1 text-xs text-brand-gray-700">{storedIdentity.did}</Text>
                </View>
                <Button loading={selfCustodyLogin.isPending} onPress={() => selfCustodyLogin.mutate()}>
                  Continue as this identity
                </Button>
              </View>
            ) : (
              !checkingDevice && (
                <View className="flex-row flex-wrap gap-1">
                  <Text className="text-sm text-brand-gray-600">No device identity found on this device.</Text>
                  <Link href="/register">
                    <Text className="font-sans-semibold text-sm text-brand-primary-600">Register one</Text>
                  </Link>
                  <Text className="text-sm text-brand-gray-600">first.</Text>
                </View>
              )
            )
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
                    <PasswordInput value={field.value} onChangeText={field.onChange} autoComplete="current-password" />
                  </FormField>
                )}
              />
              <Button loading={managedLogin.isPending} onPress={handleSubmit((values) => managedLogin.mutate(values))}>
                Sign in
              </Button>
            </View>
          )}

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-sm text-brand-gray-650">Don&apos;t have an account?</Text>
            <Link href="/register">
              <Text className="font-sans-semibold text-sm text-brand-primary-600">Register</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
