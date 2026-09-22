"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Smartphone } from "lucide-react";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatientRegister } from "./hooks/usePatientRegister";

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

export default function PatientRegisterPage() {
  const register = usePatientRegister();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<ManagedFormValues>({ resolver: zodResolver(managedSchema) });

  return (
    <AuthLayout
      headline={["Your health record,", "owned by you."]}
      subtext="Create a patient identity, accept consent requests from hospitals, and view every credential issued to you - decrypted only on your own device."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-gray-950">Create your patient account</h1>
        <p className="mt-1 text-sm text-brand-gray-650">Choose how you&apos;d like to hold your keys.</p>
      </div>

      <Tabs defaultValue="self">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="self" className="flex-1">
            This device
          </TabsTrigger>
          <TabsTrigger value="managed" className="flex-1">
            Email &amp; password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="self">
          <div className="mb-4 flex items-start gap-3 rounded-[4px] bg-brand-primary-50 p-3">
            <Smartphone className="mt-0.5 size-4 shrink-0 text-brand-primary-600" />
            <p className="text-xs text-brand-gray-700">
              Your signing keys are generated and kept on this browser only - no password, no
              recovery. This mirrors how the mobile app&apos;s self-custody mode works.
            </p>
          </div>
          <Button
            type="button"
            className="w-full"
            loading={register.isPending}
            onClick={() => register.mutate({ mode: "self" })}
          >
            Generate my identity
          </Button>
        </TabsContent>

        <TabsContent value="managed">
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => register.mutate({ mode: "managed", ...values }))}
          >
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="username" {...registerField("email")} />
            </FormField>
            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                {...registerField("password")}
              />
            </FormField>
            <FormField
              label="Confirm password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                {...registerField("confirmPassword")}
              />
            </FormField>
            <Button type="submit" className="w-full" loading={register.isPending}>
              Create account
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-brand-gray-650">
        Already have an account?{" "}
        <Link href="/patient/login" className="font-medium text-brand-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
