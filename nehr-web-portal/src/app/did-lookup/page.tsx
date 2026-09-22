import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { DidLookupPanel } from "@/components/shared/DidLookupPanel";

export default function PublicDidLookupPage() {
  return (
    <div className="min-h-screen bg-brand-gray-100">
      <header className="border-b border-brand-gray-300 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-[4px] bg-brand-primary text-white">
              <ShieldCheck className="size-4" />
            </div>
            <span className="font-averta text-sm font-semibold text-brand-blue-900">NEHR Platform</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-medium text-brand-gray-650 hover:text-brand-gray-900"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-brand-gray-950">DID Lookup</h1>
          <p className="mt-1 text-sm text-brand-gray-650">
            Publicly resolve any did:nehr identifier - no sign-in required. Any hospital can
            independently verify a presented credential this way, without contacting the issuer.
          </p>
        </div>
        <DidLookupPanel />
      </main>
    </div>
  );
}
