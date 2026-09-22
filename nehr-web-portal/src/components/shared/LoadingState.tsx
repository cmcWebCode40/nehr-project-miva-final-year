import { Loader2 } from "lucide-react";

/** The one loading treatment used everywhere, per the design brief's consistency rule. */
export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-brand-gray-600">
      <Loader2 className="size-5 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
