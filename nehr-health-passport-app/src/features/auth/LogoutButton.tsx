import { Alert, Pressable } from "react-native";
import { LogOut } from "lucide-react-native";
import { useSession } from "./useSession";

export function LogoutButton() {
  const { logout } = useSession();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      hitSlop={8}
      className="mr-4"
      onPress={() => Alert.alert("Sign out", "Sign out of your NEHR patient account?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: () => logout() },
      ])}
    >
      <LogOut size={20} color="#5F738C" />
    </Pressable>
  );
}
