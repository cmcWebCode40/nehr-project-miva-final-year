import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "neutral";
}) {
  const toneClasses = {
    primary: "bg-brand-primary-50 text-brand-primary-600",
    success: "bg-brand-green-100 text-brand-green-700",
    warning: "bg-brand-amber-100 text-brand-amber-600",
    neutral: "bg-brand-gray-200 text-brand-gray-700",
  }[tone];

  return (
    <Card className="rounded-[4px] shadow-none">
      <CardContent className="flex items-center gap-4 py-2">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-[4px]", toneClasses)}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-brand-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-brand-gray-950">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
