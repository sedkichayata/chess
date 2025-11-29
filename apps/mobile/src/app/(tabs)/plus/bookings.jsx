import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#000" }}>
          Bookings
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          View and manage your scheduled sessions.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: "#6B7280" }}>
          This is a placeholder screen. We can list your bookings here and let
          you reschedule or cancel.
        </Text>
      </ScrollView>
    </View>
  );
}
