"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useRegisterHospital } from "./hooks/useRegisterHospital";

const schema = z
  .object({
    hospitalName: z.string().min(2, "Enter the hospital's name"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm the password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterHospitalPage() {
  const register_ = useRegisterHospital();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (register_.data) {
    return (
      <AuthLayout
        headline={["Registration received,", "pending approval."]}
        subtext="A platform administrator will review and approve your hospital shortly."
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand-green-100 text-brand-green-700">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-brand-gray-950">Hospital registered</h1>
            <p className="mt-1 text-sm text-brand-gray-650">
              Status: <span className="font-medium">{register_.data.status}</span> - you can log in
              once a platform admin approves this hospital.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(register_.data!.hospitalDid);
              toast.success("DID copied");
            }}
            className="flex w-full items-center justify-between gap-2 rounded-[4px] border border-brand-gray-300 bg-brand-gray-100 px-3 py-2 text-left"
          >
            <code className="truncate text-xs text-brand-gray-700">{register_.data.hospitalDid}</code>
            <Copy className="size-3.5 shrink-0 text-brand-gray-500" />
          </button>
          <Button asChild className="w-full">
            <Link href="/hospital-admin/login">Go to login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      headline={["Bring your hospital", "onto the network."]}
      subtext="Register once, get approved by the platform, then start adding staff and issuing records."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-gray-950">Register your hospital</h1>
        <p className="mt-1 text-sm text-brand-gray-650">
          Your signing keys are generated in this browser and never leave it in plaintext.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => register_.mutate(values))}
      >
        <FormField label="Hospital name" htmlFor="hospitalName" error={errors.hospitalName?.message}>
          <Input id="hospitalName" {...register("hospitalName")} />
        </FormField>

        <FormField label="Admin email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="username" {...register("email")} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </FormField>

        <Button type="submit" className="w-full" loading={register_.isPending}>
          Register hospital
        </Button>

        <p className="text-center text-sm text-brand-gray-650">
          Already registered?{" "}
          <Link href="/hospital-admin/login" className="font-medium text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
