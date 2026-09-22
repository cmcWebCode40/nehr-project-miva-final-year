import { ShieldCheck } from "lucide-react";

export function AuthBrandPanel({
  headline,
  subtext,
}: {
  headline: [string, string];
  subtext: string;
}) {
  return (
    <div className="relative hidden h-full flex-col justify-between gap-10 overflow-hidden rounded-3xl bg-brand-blue-950 p-12 lg:flex">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-[4px] bg-white/10">
          <ShieldCheck className="size-5 text-brand-primary-200" />
        </div>
        <span className="font-averta text-sm font-semibold text-white">NEHR Platform</span>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-[32px] font-bold leading-[1.3] text-white">
          {headline[0]}
          <br />
          <span className="text-brand-primary-200">{headline[1]}</span>
        </h2>
        <p className="max-w-md text-sm text-brand-blue-100">{subtext}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-brand-blue-100">
          Every health record is signed by the issuing hospital and encrypted for the patient it
          belongs to - the platform itself never holds a plaintext copy.
        </p>
      </div>
    </div>
  );
}
