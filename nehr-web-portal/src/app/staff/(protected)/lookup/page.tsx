import { PageHeader } from "@/components/shared/PageHeader";
import { DidLookupPanel } from "@/components/shared/DidLookupPanel";

export default function StaffLookupPage() {
  return (
    <div>
      <PageHeader title="DID Lookup" description="Resolve any DID's public document and status." />
      <DidLookupPanel />
    </div>
  );
}
