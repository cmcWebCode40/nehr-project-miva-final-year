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
import { usePatientLogin } from "./hooks/usePatientLogin";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function PatientLoginPage() {
  const { managedLogin, selfCustodyLogin, storedIdentity } = usePatientLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <AuthLayout
      headline={["Your health record,", "owned by you."]}
      subtext="Accept consent requests from hospitals and view every credential issued to you - decrypted only on your own device."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-gray-950">Patient</h1>
        <p className="mt-1 text-sm text-brand-gray-650">Sign in to your NEHR patient account.</p>
      </div>

      <Tabs defaultValue={storedIdentity ? "self" : "managed"}>
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="self" className="flex-1">
            This device
          </TabsTrigger>
          <TabsTrigger value="managed" className="flex-1">
            Email &amp; password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="self">
          {storedIdentity ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-[4px] bg-brand-primary-50 p-3">
                <Smartphone className="mt-0.5 size-4 shrink-0 text-brand-primary-600" />
                <p className="break-all text-xs text-brand-gray-700">{storedIdentity.did}</p>
              </div>
              <Button
                type="button"
                className="w-full"
                loading={selfCustodyLogin.isPending}
                onClick={() => selfCustodyLogin.mutate()}
              >
                Continue as this identity
              </Button>
            </div>
          ) : (
            <p className="text-sm text-brand-gray-600">
              No device identity found on this browser.{" "}
              <Link href="/patient/register" className="font-medium text-brand-primary-600 hover:underline">
                Register one
              </Link>{" "}
              first.
            </p>
          )}
        </TabsContent>

        <TabsContent value="managed">
          <form className="space-y-4" onSubmit={handleSubmit((values) => managedLogin.mutate(values))}>
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="username" {...register("email")} />
            </FormField>
            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                {...register("password")}
              />
            </FormField>
            <Button type="submit" className="w-full" loading={managedLogin.isPending}>
              Sign in
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-brand-gray-650">
        Don&apos;t have an account?{" "}
        <Link href="/patient/register" className="font-medium text-brand-primary-600 hover:underline">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
