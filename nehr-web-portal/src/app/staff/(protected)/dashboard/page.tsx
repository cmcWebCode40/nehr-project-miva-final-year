"use client";

import Link from "next/link";
import { FileCheck2, FileSignature, IdCard, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConsents } from "../consents/hooks/useConsents";

export default function StaffDashboardPage() {
  const { consents } = useConsents();

  const granted = consents?.filter((c) => c.status === "GRANTED").length ?? 0;
  const pending = consents?.filter((c) => c.status === "PENDING").length ?? 0;

  return (
    <div>
      <PageHeader title="Overview" description="Your consent activity at a glance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Consent requests" value={consents?.length ?? 0} icon={FileCheck2} tone="primary" />
        <StatCard label="Pending" value={pending} icon={Clock} tone="warning" />
        <StatCard label="Granted" value={granted} icon={FileCheck2} tone="success" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[4px] shadow-none">
          <CardContent className="flex flex-col items-start gap-3">
            <FileCheck2 className="size-5 text-brand-primary-600" />
            <div>
              <p className="text-sm font-semibold text-brand-gray-950">Request consent</p>
              <p className="text-xs text-brand-gray-600">Ask a patient to grant access to a scope of records.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/staff/consents">Go to Consents</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[4px] shadow-none">
          <CardContent className="flex flex-col items-start gap-3">
            <FileSignature className="size-5 text-brand-primary-600" />
            <div>
              <p className="text-sm font-semibold text-brand-gray-950">Issue a credential</p>
              <p className="text-xs text-brand-gray-600">Sign and encrypt a record for a consenting patient.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/staff/credentials">Go to Credentials</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[4px] shadow-none">
          <CardContent className="flex flex-col items-start gap-3">
            <IdCard className="size-5 text-brand-primary-600" />
            <div>
              <p className="text-sm font-semibold text-brand-gray-950">Look up a DID</p>
              <p className="text-xs text-brand-gray-600">Resolve any DID Document and verify its status.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/staff/lookup">Go to Lookup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
