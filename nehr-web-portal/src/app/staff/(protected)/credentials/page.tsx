"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { FileSignature, Ban } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormField } from "@/components/shared/FormField";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { VC_TYPES, findVcType } from "@/lib/vc-types";
import { useManageCredentials } from "./hooks/useManageCredentials";
import { VcContentFields } from "./components/VcContentFields";

const schema = z.object({
  patientDid: z.string().min(1, "Patient DID is required"),
  vcType: z.string().min(1, "Select a credential type"),
  doctorPassword: z.string().min(1, "Your password is required to sign this"),
});

type FormValues = z.infer<typeof schema>;

export default function StaffCredentialsPage() {
  const { credentials, isLoading, issueCredential, revokeCredential } = useManageCredentials();
  const [content, setContent] = useState<Record<string, string>>({});
  const [contentErrors, setContentErrors] = useState<Record<string, string>>({});
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedType = findVcType(watch("vcType") ?? "");

  const onSubmit = (values: FormValues) => {
    const vcType = findVcType(values.vcType);
    if (!vcType) return;

    const missing: Record<string, string> = {};
    vcType.fields.forEach((field) => {
      if (field.required && !content[field.name]?.trim()) {
        missing[field.name] = `${field.label.replace(" *", "")} is required`;
      }
    });
    if (Object.keys(missing).length > 0) {
      setContentErrors(missing);
      return;
    }
    setContentErrors({});

    const trimmedContent = Object.fromEntries(
      Object.entries(content).filter(([, value]) => value.trim().length > 0)
    );

    issueCredential.mutate(
      {
        patientDid: values.patientDid,
        resourceType: vcType.value,
        content: trimmedContent,
        doctorPassword: values.doctorPassword,
      },
      {
        onSuccess: () => {
          reset({ patientDid: "", vcType: "", doctorPassword: "" });
          setContent({});
          setContentErrors({});
        },
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="Issue a credential"
        description="Signed with your hospital's key, encrypted for the patient - gated by an active consent covering this credential type."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="rounded-[4px] shadow-none">
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <FormField label="Patient DID" htmlFor="patientDid" error={errors.patientDid?.message}>
                <Input id="patientDid" placeholder="did:nehr:..." {...register("patientDid")} />
              </FormField>

              <FormField
                label="Credential type"
                htmlFor="vcType"
                error={errors.vcType?.message}
                hint="Must match a type the patient has consented to."
              >
                <Controller
                  control={control}
                  name="vcType"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setContent({});
                        setContentErrors({});
                      }}
                    >
                      <SelectTrigger id="vcType" className="w-full">
                        <SelectValue placeholder="Select a credential type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {VC_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              {selectedType && (
                <VcContentFields
                  fields={selectedType.fields}
                  values={content}
                  errors={contentErrors}
                  onChange={(name, value) => setContent((prev) => ({ ...prev, [name]: value }))}
                />
              )}

              <FormField
                label="Your password"
                htmlFor="doctorPassword"
                error={errors.doctorPassword?.message}
                hint="Unwraps your hospital's signing key for this one credential, then it's discarded."
              >
                <PasswordInput id="doctorPassword" {...register("doctorPassword")} />
              </FormField>

              <Button type="submit" loading={issueCredential.isPending}>
                <FileSignature />
                Issue credential
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-brand-gray-800">Issued by your hospital</h2>
          {isLoading ? (
            <LoadingState label="Loading credentials..." />
          ) : !credentials || credentials.length === 0 ? (
            <EmptyState message="Nothing issued yet" hint="Issued credentials will appear here." />
          ) : (
            <div className="space-y-2">
              {credentials.map((result) => (
                <Card key={result.recordId} className="rounded-[4px] shadow-none">
                  <CardContent className="py-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-brand-gray-700">{result.recordId}</p>
                        <p className="mt-1 text-brand-gray-600">
                          For <code>{result.patientDid}</code>
                        </p>
                        <p className="mt-1 text-brand-gray-500">
                          {format(new Date(result.issuedAt), "d MMM yyyy, HH:mm")}
                        </p>
                      </div>
                      <StatusBadge status={result.revoked ? "REVOKED" : "ACTIVE"} />
                    </div>
                    {!result.revoked && (
                      <Button
                        variant="destructive"
                        size="xs"
                        className="mt-2"
                        loading={revokeCredential.isPending}
                        onClick={() => revokeCredential.mutate(result.recordId)}
                      >
                        <Ban />
                        Revoke
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
