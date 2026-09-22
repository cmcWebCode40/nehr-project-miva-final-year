"use client";

import Link from "next/link";
import { FileCheck2, FileText, IdCard, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyConsents } from "../consents/hooks/useMyConsents";
import { useMyRecords } from "../records/hooks/useMyRecords";

export default function PatientDashboardPage() {
  const { consents } = useMyConsents();
  const { records } = useMyRecords();

  const pending = consents?.filter((c) => c.status === "PENDING").length ?? 0;

  return (
    <div>
      <PageHeader title="Overview" description="Your consent requests and records at a glance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending requests" value={pending} icon={Clock} tone="warning" />
        <StatCard label="Consent requests" value={consents?.length ?? 0} icon={FileCheck2} tone="primary" />
        <StatCard label="Records" value={records?.length ?? 0} icon={FileText} tone="success" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[4px] shadow-none">
          <CardContent className="flex flex-col items-start gap-3">
            <FileCheck2 className="size-5 text-brand-primary-600" />
            <div>
              <p className="text-sm font-semibold text-brand-gray-950">Consent requests</p>
              <p className="text-xs text-brand-gray-600">Accept or decline hospital requests for access.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/patient/consents">Go to Consents</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[4px] shadow-none">
          <CardContent className="flex flex-col items-start gap-3">
            <FileText className="size-5 text-brand-primary-600" />
            <div>
              <p className="text-sm font-semibold text-brand-gray-950">My records</p>
              <p className="text-xs text-brand-gray-600">View every credential issued to you.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/patient/records">Go to Records</Link>
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
              <Link href="/patient/lookup">Go to Lookup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
