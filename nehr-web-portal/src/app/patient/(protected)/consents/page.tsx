"use client";

import { format } from "date-fns";
import { Check, Ban } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyConsents } from "./hooks/useMyConsents";

export default function PatientConsentsPage() {
  const { consents, isLoading, canSign, acceptConsent, revokeConsent } = useMyConsents();

  return (
    <div>
      <PageHeader
        title="Consent requests"
        description="Hospitals asking to issue or view records in a given scope - nothing is shared until you accept."
      />

      {!canSign && (
        <div className="mb-4 rounded-[4px] bg-brand-amber-50 p-3 text-xs text-brand-amber-700">
          Your signing key isn&apos;t loaded in this tab (this can happen after a refresh for an
          email &amp; password account). Sign in again to accept a request.
        </div>
      )}

      {isLoading ? (
        <LoadingState label="Loading consent requests..." />
      ) : !consents || consents.length === 0 ? (
        <EmptyState message="No consent requests yet" hint="Requests from hospitals will appear here." />
      ) : (
        <div className="space-y-3">
          {consents.map((consent) => (
            <Card key={consent.consentId} className="rounded-[4px] shadow-none">
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-brand-gray-950">
                      Hospital <code className="text-xs">{consent.granteeDid}</code>
                    </p>
                    {consent.purpose && <p className="text-xs text-brand-gray-600">{consent.purpose}</p>}
                  </div>
                  <StatusBadge status={consent.status} />
                </div>

                <div className="flex flex-wrap gap-1">
                  {consent.scope.map((type) => (
                    <span
                      key={type}
                      className="rounded-[4px] bg-brand-gray-200 px-1.5 py-0.5 text-xs text-brand-gray-700"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-brand-gray-500">
                  {consent.validUntil
                    ? `Valid until ${format(new Date(consent.validUntil), "d MMM yyyy")}`
                    : "No expiry"}
                </p>

                {consent.status === "PENDING" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      disabled={!canSign}
                      loading={acceptConsent.isPending}
                      onClick={() => acceptConsent.mutate(consent)}
                    >
                      <Check />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={revokeConsent.isPending}
                      onClick={() => revokeConsent.mutate(consent.consentId)}
                    >
                      <Ban />
                      Decline
                    </Button>
                  </div>
                )}

                {consent.status === "GRANTED" && (
                  <div className="pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      loading={revokeConsent.isPending}
                      onClick={() => revokeConsent.mutate(consent.consentId)}
                    >
                      <Ban />
                      Revoke access
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
