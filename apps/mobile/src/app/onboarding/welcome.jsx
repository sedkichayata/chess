import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight } from "lucide-react-native";

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar style="dark" />

      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        {/* Hero Image */}
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: "#f3f4f6",
              borderRadius: 100,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <Text style={{ fontSize: 64 }}>♛</Text>
          </View>

          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              textAlign: "center",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Welcome to Chess Masters
          </Text>

          <Text
            style={{
              fontSize: 18,
              textAlign: "center",
              color: "#6b7280",
              lineHeight: 28,
              paddingHorizontal: 20,
            }}
          >
            Learn from world-class chess masters and take your game to the next
            level
          </Text>
        </View>

        {/* Bottom Action */}
        <View style={{ paddingBottom: 40 }}>
          <TouchableOpacity
            onPress={() => router.push("/onboarding/skill-level")}
            style={{
              backgroundColor: "#1f2937",
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 18,
                fontWeight: "600",
                marginRight: 8,
              }}
            >
              Get Started
            </Text>
            <ChevronRight size={20} color="#ffffff" />
          </TouchableOpacity>

          <Text
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 14,
              marginTop: 16,
            }}
          >
            Join thousands of players improving their chess
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
