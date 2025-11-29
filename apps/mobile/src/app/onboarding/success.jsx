import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle, ArrowRight } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Success() {
  const router = useRouter();

  useEffect(() => {
    // Mark onboarding as completed
    markOnboardingCompleted();
  }, []);

  const markOnboardingCompleted = async () => {
    try {
      await AsyncStorage.setItem("onboarding_completed", "true");
      console.log("Onboarding completed successfully!");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const handleGoToApp = () => {
    // Navigate to the main app
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar style="dark" />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Success Icon */}
        <View
          style={{
            width: 120,
            height: 120,
            backgroundColor: "#dcfce7",
            borderRadius: 60,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <CheckCircle size={64} color="#059669" />
        </View>

        {/* Success Message */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            textAlign: "center",
            color: "#111827",
            marginBottom: 16,
          }}
        >
          Welcome to Chess Masters!
        </Text>

        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            color: "#6b7280",
            lineHeight: 28,
            marginBottom: 8,
          }}
        >
          Your subscription is now active!
        </Text>

        <Text
          style={{
            fontSize: 16,
            textAlign: "center",
            color: "#6b7280",
            lineHeight: 24,
            marginBottom: 48,
          }}
        >
          You now have access to exclusive content, priority booking, and
          personalized coaching from your chosen chess master.
        </Text>

        {/* Features List */}
        <View style={{ width: "100%", marginBottom: 48 }}>
          {[
            "📚 Exclusive learning content",
            "⭐ Priority session booking",
            "💬 Direct master communication",
            "📊 Progress tracking",
          ].map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 12 }}>
                {feature.split(" ")[0]}
              </Text>
              <Text style={{ fontSize: 16, color: "#374151" }}>
                {feature.substring(feature.indexOf(" ") + 1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Action */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={handleGoToApp}
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
            Start Learning
          </Text>
          <ArrowRight size={20} color="#ffffff" />
        </TouchableOpacity>

        <Text
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 14,
            marginTop: 16,
          }}
        >
          Ready to take your chess to the next level?
        </Text>
      </View>
    </SafeAreaView>
  );
}
