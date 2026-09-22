"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useStaffLogin } from "./hooks/useStaffLogin";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function StaffLoginPage() {
  const login = useStaffLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <AuthLayout
      headline={["Patient records,", "at the point of care."]}
      subtext="Request consent, issue signed records, and verify credentials from any participating hospital."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-gray-950">Health Staff</h1>
        <p className="mt-1 text-sm text-brand-gray-650">
          Sign in with the credentials your hospital admin gave you.
        </p>
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
      </form>
    </AuthLayout>
  );
}
