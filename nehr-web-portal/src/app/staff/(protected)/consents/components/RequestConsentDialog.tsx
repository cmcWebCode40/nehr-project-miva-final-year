"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FilePlus2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/FormField";
import { VC_TYPES } from "@/lib/vc-types";
import { useConsents } from "../hooks/useConsents";

const schema = z.object({
  patientDid: z.string().min(1, "Patient DID is required"),
  scope: z.array(z.string()).min(1, "Select at least one credential type"),
  purpose: z.string().optional(),
  validityDays: z.coerce.number().int().positive().optional(),
});

type FormValues = z.infer<typeof schema>;

export function RequestConsentDialog() {
  const [open, setOpen] = useState(false);
  const { requestConsent } = useConsents();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { scope: [] } });

  const selectedScope = watch("scope") ?? [];

  const toggleScope = (value: string, checked: boolean) => {
    setValue(
      "scope",
      checked ? [...selectedScope, value] : selectedScope.filter((item) => item !== value),
      { shouldValidate: true }
    );
  };

  const onSubmit = (values: FormValues) => {
    requestConsent.mutate(
      { patientDid: values.patientDid, scope: values.scope, purpose: values.purpose, validityDays: values.validityDays },
      {
        onSuccess: () => {
          reset({ patientDid: "", scope: [], purpose: "", validityDays: undefined });
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <FilePlus2 />
          Request consent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Request patient consent</DialogTitle>
            <DialogDescription>
              The patient must sign this request before you can issue any records in scope.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <FormField label="Patient DID" htmlFor="patientDid" error={errors.patientDid?.message}>
              <Input id="patientDid" placeholder="did:nehr:..." {...register("patientDid")} />
            </FormField>
            <FormField label="Credential types" htmlFor="scope" error={errors.scope?.message}>
              <div id="scope" className="space-y-2 rounded-[4px] border border-input p-3">
                {VC_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`scope-${type.value}`}
                      checked={selectedScope.includes(type.value)}
                      onCheckedChange={(checked) => toggleScope(type.value, checked === true)}
                    />
                    <Label htmlFor={`scope-${type.value}`} className="text-sm font-normal">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </FormField>
            <FormField label="Purpose" htmlFor="purpose" error={errors.purpose?.message}>
              <Textarea id="purpose" rows={2} {...register("purpose")} />
            </FormField>
            <FormField
              label="Validity (days)"
              htmlFor="validityDays"
              error={errors.validityDays?.message}
              hint="Leave blank for no expiry"
            >
              <Input id="validityDays" type="number" min={1} {...register("validityDays")} />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="submit" loading={requestConsent.isPending}>
              Send request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
