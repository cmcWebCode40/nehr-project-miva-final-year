import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Check, Copy, Search } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Surfaces the signed-in patient's own DID (managed or self-custody alike -
 * the backend sets the token subject to the patient DID in both cases) so it
 * can be copied out or resolved in place from the lookup screen.
 */
export function MyDidCard({ did, onResolve }: { did: string; onResolve: (did: string) => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(did);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <CardContent>
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-semibold text-sm text-brand-gray-950">Your DID</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copied ? "DID copied" : "Copy DID"}
            onPress={handleCopy}
            className="flex-row items-center gap-1 rounded px-2 py-1 active:bg-secondary"
          >
            {copied ? <Check size={14} color="#00A63E" /> : <Copy size={14} color="#025EAD" />}
            <Text className="font-sans-semibold text-xs text-brand-primary-600">{copied ? "Copied" : "Copy"}</Text>
          </Pressable>
        </View>

        <Text selectable className="text-xs text-brand-gray-700">
          {did}
        </Text>

        <Button variant="outline" size="sm" onPress={() => onResolve(did)} icon={<Search size={16} color="#025EAD" />}>
          Resolve my DID
        </Button>
      </CardContent>
    </Card>
  );
}
