import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function AnalysisScreen() {
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
          AI Coach
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          Analyze weaknesses and track progress.
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
        <Text style={{ color: "#6B7280", marginBottom: 12 }}>
          Use the Profile screen inside Plus to link your Chess.com account, run
          analysis, and save snapshots.
        </Text>
        <Link
          href="/(tabs)/plus/profile"
          style={{ color: "#2563EB", fontWeight: "600" }}
        >
          Go to Profile →
        </Link>
      </ScrollView>
    </View>
  );
}
