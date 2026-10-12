import { LogoutButton } from "@/features/auth/LogoutButton";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { useRecoverSelfCustodyKeys } from "@/features/auth/useRecoverSelfCustodyKeys";
import { Tabs } from "expo-router";
import { FileCheck2, FileText, IdCard, LayoutDashboard } from "lucide-react-native";

function ProtectedTabs() {
  useRecoverSelfCustodyKeys();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontFamily: "Averta-Bold", fontSize: 17, color: "#1F2126" },
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerShadowVisible: false,
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: "#0275D8",
        tabBarInactiveTintColor: "#848F9F",
        tabBarLabelStyle: { fontFamily: "Averta-Semibold", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="consents"
        options={{ title: "Consents", tabBarIcon: ({ color, size }) => <FileCheck2 color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="records"
        options={{ title: "Records", tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="lookup"
        options={{ title: "DID Lookup", tabBarIcon: ({ color, size }) => <IdCard color={color} size={size} /> }}
      />
    </Tabs>
  );
}

export default function ProtectedLayout() {
  return (
    <RequireAuth>
      <ProtectedTabs />
    </RequireAuth>
  );
}
