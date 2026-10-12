import { Text, View } from "react-native";

/**
 * Mobile-adapted version of the web portal's `AuthBrandPanel` - the web
 * layout puts the headline/subtext in a decorative side panel that only
 * shows on wide screens; a phone has no room for a second column, so it
 * becomes a compact hero blurb above the form instead. Same copy, same
 * screens, just single-column - not a redesign of the flow.
 */
export function AuthHero({ headline, subtext }: { headline: [string, string]; subtext: string }) {
  return (
    <View className="mb-8">
      <Text className="font-sans-extrabold text-3xl leading-tight text-brand-gray-950">
        {headline[0]}
        {"\n"}
        {headline[1]}
      </Text>
      <Text className="mt-2 text-sm text-brand-gray-650">{subtext}</Text>
    </View>
  );
}
