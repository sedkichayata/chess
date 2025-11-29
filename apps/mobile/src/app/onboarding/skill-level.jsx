import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, ChevronLeft } from "lucide-react-native";

const skillLevels = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Just starting out or learning the basics",
    icon: "🌱",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Know the rules and some basic strategies",
    icon: "📈",
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Strong player looking to reach the next level",
    icon: "🎯",
  },
  {
    id: "expert",
    title: "Expert",
    description: "Competitive player seeking master-level coaching",
    icon: "👑",
  },
];

export default function SkillLevel() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const router = useRouter();

  const handleContinue = () => {
    if (selectedLevel) {
      router.push("/onboarding/goals");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar style="dark" />

      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingVertical: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              What's your skill level?
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
              Step 1 of 3
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            height: 4,
            backgroundColor: "#f3f4f6",
            marginHorizontal: 24,
            borderRadius: 2,
            marginBottom: 32,
          }}
        >
          <View
            style={{
              width: "33%",
              height: "100%",
              backgroundColor: "#1f2937",
              borderRadius: 2,
            }}
          />
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#6b7280",
              marginBottom: 24,
              lineHeight: 24,
            }}
          >
            This helps us recommend the perfect chess master for your learning
            journey.
          </Text>

          {skillLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              onPress={() => setSelectedLevel(level.id)}
              style={{
                padding: 20,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedLevel === level.id ? "#1f2937" : "#e5e7eb",
                backgroundColor:
                  selectedLevel === level.id ? "#f9fafb" : "#ffffff",
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 32, marginRight: 16 }}>
                {level.icon}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  {level.title}
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#6b7280", lineHeight: 20 }}
                >
                  {level.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Continue Button */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedLevel}
            style={{
              backgroundColor: selectedLevel ? "#1f2937" : "#d1d5db",
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
                color: selectedLevel ? "#ffffff" : "#9ca3af",
                fontSize: 18,
                fontWeight: "600",
                marginRight: 8,
              }}
            >
              Continue
            </Text>
            <ChevronRight
              size={20}
              color={selectedLevel ? "#ffffff" : "#9ca3af"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
