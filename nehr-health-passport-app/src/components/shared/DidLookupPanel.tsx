import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { format } from "date-fns";
import { Search } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { MyDidCard } from "./MyDidCard";
import { useDidLookup } from "@/features/did-lookup/hooks/useDidLookup";

export function DidLookupPanel({ ownDid }: { ownDid?: string }) {
  const [value, setValue] = useState("");
  const { lookup, result, isLoading, isError, hasSearched } = useDidLookup();

  return (
    <View className="gap-4">
      {ownDid ? <MyDidCard did={ownDid} onResolve={lookup} /> : null}

      <View className="flex-row gap-2">
        <Input
          value={value}
          onChangeText={setValue}
          placeholder="did:nehr:..."
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1"
          onSubmitEditing={() => value.trim() && lookup(value)}
        />
        <Button onPress={() => value.trim() && lookup(value)} loading={isLoading} icon={<Search size={16} color="#FFFFFF" />}>
          Resolve
        </Button>
      </View>

      {isLoading && <LoadingState label="Resolving DID..." />}

      {!isLoading && isError && <EmptyState message="No DID Document found" hint="Check the DID and try again." />}

      {!isLoading && !isError && hasSearched && result && (
        <View className="gap-4">
          <Card>
            <CardContent>
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-semibold text-sm text-brand-gray-950">Status</Text>
                <StatusBadge status={result.didDocumentMetadata.deactivated ? "REVOKED" : "ACTIVE"} />
              </View>
              <View className="flex-row gap-6">
                <View>
                  <Text className="font-sans-semibold text-xs text-brand-gray-800">Created</Text>
                  <Text className="text-xs text-brand-gray-650">
                    {format(new Date(result.didDocumentMetadata.created), "d MMM yyyy, HH:mm")}
                  </Text>
                </View>
                <View>
                  <Text className="font-sans-semibold text-xs text-brand-gray-800">Updated</Text>
                  <Text className="text-xs text-brand-gray-650">
                    {format(new Date(result.didDocumentMetadata.updated), "d MMM yyyy, HH:mm")}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Text className="mb-2 font-sans-semibold text-sm text-brand-gray-950">DID Document</Text>
              <ScrollView horizontal className="max-h-72 rounded bg-brand-gray-950 p-3">
                <Text className="font-mono text-xs text-brand-gray-100">
                  {JSON.stringify(result.didDocument, null, 2)}
                </Text>
              </ScrollView>
            </CardContent>
          </Card>
        </View>
      )}
    </View>
  );
}
