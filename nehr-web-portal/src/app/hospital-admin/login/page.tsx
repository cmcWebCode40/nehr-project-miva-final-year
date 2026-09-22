"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useHospitalAdminLogin } from "./hooks/useHospitalAdminLogin";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function HospitalAdminLoginPage() {
  const login = useHospitalAdminLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <AuthLayout
      headline={["Your hospital,", "connected to the network."]}
      subtext="Manage staff, review consent activity, and keep your records interoperable."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-gray-950">Health Admin</h1>
        <p className="mt-1 text-sm text-brand-gray-650">Sign in to manage your hospital.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit((values) => login.mutate(values))}>
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

        <Button type="submit" className="w-full" loading={login.isPending}>
          Sign in
        </Button>

        <p className="text-center text-sm text-brand-gray-650">
          Not registered yet?{" "}
          <Link href="/hospital-admin/register" className="font-medium text-brand-primary hover:underline">
            Register your hospital
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
