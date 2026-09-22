import { Inbox } from "lucide-react";

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-brand-gray-300 py-16 text-center">
      <Inbox className="size-6 text-brand-gray-500" />
      <p className="text-sm font-medium text-brand-gray-700">{message}</p>
      {hint && <p className="max-w-xs text-xs text-brand-gray-600">{hint}</p>}
    </div>
  );
}
