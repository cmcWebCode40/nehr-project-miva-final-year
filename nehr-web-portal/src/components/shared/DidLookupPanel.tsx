"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { StatusBadge } from "./StatusBadge";
import { useDidLookup } from "@/hooks/useDidLookup";

export function DidLookupPanel() {
  const [value, setValue] = useState("");
  const { lookup, result, isLoading, isError, hasSearched } = useDidLookup();

  return (
    <div className="space-y-6">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) lookup(value);
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="did:nehr:..."
          className="flex-1"
        />
        <Button type="submit" loading={isLoading}>
          <Search />
          Resolve
        </Button>
      </form>

      {isLoading && <LoadingState label="Resolving DID..." />}

      {!isLoading && isError && (
        <EmptyState message="No DID Document found" hint="Check the DID and try again." />
      )}

      {!isLoading && !isError && hasSearched && result && (
        <div className="space-y-4">
          <Card className="rounded-[4px] shadow-none">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-gray-950">Status</p>
                <StatusBadge status={result.didDocumentMetadata.deactivated ? "REVOKED" : "ACTIVE"} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-brand-gray-650">
                <div>
                  <p className="font-medium text-brand-gray-800">Created</p>
                  <p>{format(new Date(result.didDocumentMetadata.created), "d MMM yyyy, HH:mm")}</p>
                </div>
                <div>
                  <p className="font-medium text-brand-gray-800">Updated</p>
                  <p>{format(new Date(result.didDocumentMetadata.updated), "d MMM yyyy, HH:mm")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[4px] shadow-none">
            <CardContent>
              <p className="mb-2 text-sm font-semibold text-brand-gray-950">DID Document</p>
              <pre className="max-h-96 overflow-auto rounded-[4px] bg-brand-gray-950 p-4 text-xs text-brand-gray-100">
                {JSON.stringify(result.didDocument, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
