import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VcTypeField } from "@/lib/vc-types";

/**
 * Renders one plain-language input per field of the selected VC type,
 * in place of the raw JSON textarea this page used to show - a hospital
 * staff member issuing a malaria result shouldn't need to know or care
 * that it becomes a JSON object underneath.
 */
export function VcContentFields({
  fields,
  values,
  errors,
  onChange,
}: {
  fields: VcTypeField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.name}
          label={field.required ? `${field.label} *` : field.label}
          htmlFor={`content-${field.name}`}
          error={errors[field.name]}
          hint={field.hint}
        >
          {field.kind === "select" ? (
            <Select value={values[field.name] ?? ""} onValueChange={(value) => onChange(field.name, value)}>
              <SelectTrigger id={`content-${field.name}`} className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.kind === "textarea" ? (
            <Textarea
              id={`content-${field.name}`}
              rows={3}
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          ) : (
            <Input
              id={`content-${field.name}`}
              type={field.kind}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}
        </FormField>
      ))}
    </div>
  );
}
