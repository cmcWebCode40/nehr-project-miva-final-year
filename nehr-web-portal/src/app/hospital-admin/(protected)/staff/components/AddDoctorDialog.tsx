"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/shared/FormField";
import { useManageStaff } from "../hooks/useManageStaff";

const schema = z.object({
  fullName: z.string().min(2, "Enter the doctor's full name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  role: z.string().min(2, "Enter a role, e.g. Physician"),
  department: z.string().optional(),
  licenceNumber: z.string().optional(),
  defaultPassword: z.string().min(8, "Default password must be at least 8 characters"),
  adminPassword: z.string().min(1, "Your admin password is required to authorize this"),
});

type FormValues = z.infer<typeof schema>;

export function AddDoctorDialog() {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const { addDoctor } = useManageStaff();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      reset();
      setCreated(null);
    }
  };

  const onSubmit = (values: FormValues) => {
    addDoctor.mutate(values, {
      onSuccess: (doctor) => {
        toast.success(`${doctor.fullName} added`);
        setCreated({ email: values.email, password: values.defaultPassword });
        reset();
      },
    });
  };

  const copyCredentials = () => {
    if (!created) return;
    navigator.clipboard.writeText(`Email: ${created.email}\nPassword: ${created.password}`);
    toast.success("Credentials copied");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus />
          Add staff
        </Button>
      </DialogTrigger>
      <DialogContent>
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Staff added</DialogTitle>
              <DialogDescription>
                Share these credentials with the doctor - they can log in immediately.
              </DialogDescription>
            </DialogHeader>
            <button
              type="button"
              onClick={copyCredentials}
              className="flex w-full items-center justify-between gap-2 rounded-[4px] border border-brand-gray-300 bg-brand-gray-100 px-3 py-2.5 text-left"
            >
              <div className="min-w-0 text-sm">
                <p className="truncate text-brand-gray-900">{created.email}</p>
                <p className="truncate font-mono text-brand-gray-650">{created.password}</p>
              </div>
              <Copy className="size-3.5 shrink-0 text-brand-gray-500" />
            </button>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add staff member</DialogTitle>
              <DialogDescription>
                Your admin password authorizes this doctor to sign records on the hospital&apos;s
                behalf - it is used once, here, and never stored.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
                <Input id="fullName" {...register("fullName")} />
              </FormField>
              <FormField label="Email" htmlFor="doctorEmail" error={errors.email?.message}>
                <Input id="doctorEmail" type="email" {...register("email")} />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Role" htmlFor="role" error={errors.role?.message}>
                  <Input id="role" placeholder="Physician" {...register("role")} />
                </FormField>
                <FormField label="Department" htmlFor="department" error={errors.department?.message}>
                  <Input id="department" placeholder="Optional" {...register("department")} />
                </FormField>
              </div>
              <FormField
                label="Licence number"
                htmlFor="licenceNumber"
                error={errors.licenceNumber?.message}
              >
                <Input id="licenceNumber" placeholder="Optional" {...register("licenceNumber")} />
              </FormField>
              <FormField
                label="Default password"
                htmlFor="defaultPassword"
                error={errors.defaultPassword?.message}
                hint="The doctor logs in with this immediately - no forced reset yet."
              >
                <Input id="defaultPassword" type="text" {...register("defaultPassword")} />
              </FormField>
              <FormField
                label="Your admin password"
                htmlFor="adminPassword"
                error={errors.adminPassword?.message}
              >
                <PasswordInput id="adminPassword" {...register("adminPassword")} />
              </FormField>
            </div>

            <DialogFooter>
              <Button type="submit" loading={addDoctor.isPending}>
                Add staff member
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
