import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  neutral: "bg-brand-gray-200 text-brand-gray-800",
  info: "bg-brand-primary-50 text-brand-primary-600",
  success: "bg-brand-green-100 text-brand-green-700",
  warning: "bg-brand-amber-100 text-brand-amber-600",
  danger: "bg-brand-red-50 text-brand-red-600",
} as const;

type Tone = keyof typeof TONE_CLASSES;

const STATUS_TONE: Record<string, Tone> = {
  PENDING: "warning",
  APPROVED: "success",
  ACTIVE: "success",
  GRANTED: "success",
  SUSPENDED: "danger",
  REMOVED: "danger",
  REVOKED: "danger",
  EXPIRED: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        TONE_CLASSES[tone]
      )}
    >
      {status}
    </span>
  );
}
