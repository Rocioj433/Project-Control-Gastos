import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { COLORS } from "../services/theme";

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            height: 70,
            paddingBottom: 10,
            paddingTop: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon="🏠" active={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            title: "Subir",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon="📤" active={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="gastos"
          options={{
            title: "Gastos",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon="💰" active={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="resumen"
          options={{
            title: "Resumen",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon="📊" active={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  return (
    <View
      style={{
        width: 40,
        height: 32,
        borderRadius: 16,
        backgroundColor: active ? COLORS.primary + "15" : "transparent",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
  );
}
