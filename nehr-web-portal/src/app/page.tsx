import Link from "next/link";
import { Building2, IdCard, ShieldCheck, Stethoscope, User, UserCog } from "lucide-react";

const ENTRY_POINTS = [
  {
    label: "Platform Admin",
    description: "Approve hospitals and oversee platform-wide activity.",
    href: "/platform-admin/login",
    icon: UserCog,
  },
  {
    label: "Health Admin",
    description: "Manage your hospital's staff and consent activity.",
    href: "/hospital-admin/login",
    icon: Building2,
  },
  {
    label: "Health Staff",
    description: "Request consent, issue, and verify patient records.",
    href: "/staff/login",
    icon: Stethoscope,
  },
  {
    label: "Patient",
    description: "Accept consent requests and view your own records.",
    href: "/patient/login",
    icon: User,
  },
  {
    label: "DID Lookup",
    description: "Publicly resolve any DID Document - no sign-in required.",
    href: "/did-lookup",
    icon: IdCard,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-brand-gray-100 px-4 py-16">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-[4px] bg-brand-primary text-white">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold text-brand-gray-950">NEHR Platform</h1>
        <p className="mt-2 max-w-md text-sm text-brand-gray-650">
          Decentralized-identity, patient-controlled health records for Nigerian hospitals.
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {ENTRY_POINTS.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className="group flex flex-col gap-3 rounded-[4px] border border-brand-gray-300 bg-white p-5 transition-colors hover:border-brand-primary-200 hover:bg-brand-primary-25"
          >
            <div className="flex size-9 items-center justify-center rounded-[4px] bg-brand-primary-50 text-brand-primary-600 transition-colors group-hover:bg-brand-primary group-hover:text-white">
              <entry.icon className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-gray-950">{entry.label}</p>
              <p className="mt-0.5 text-xs text-brand-gray-650">{entry.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs text-brand-gray-600">
        New hospital?{" "}
        <Link href="/hospital-admin/register" className="font-medium text-brand-primary hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
