import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, ChevronLeft } from "lucide-react-native";

const goals = [
  {
    id: "improve-rating",
    title: "Improve My Rating",
    description: "Increase my chess rating and competitive performance",
    icon: "📊",
  },
  {
    id: "learn-openings",
    title: "Master Openings",
    description: "Build a strong opening repertoire",
    icon: "🎯",
  },
  {
    id: "tactical-skills",
    title: "Tactical Training",
    description: "Sharpen my tactical vision and calculation",
    icon: "⚡",
  },
  {
    id: "endgame-mastery",
    title: "Endgame Mastery",
    description: "Learn essential endgame patterns and techniques",
    icon: "🏁",
  },
  {
    id: "tournament-prep",
    title: "Tournament Preparation",
    description: "Get ready for competitive chess tournaments",
    icon: "🏆",
  },
  {
    id: "casual-improvement",
    title: "Casual Improvement",
    description: "Have fun while gradually getting better",
    icon: "😊",
  },
];

export default function Goals() {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const router = useRouter();

  const toggleGoal = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId],
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      router.push("/onboarding/elo");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
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
              What are your goals?
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
              Step 2 of 4
            </Text>
          </View>
        </View>

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
              width: "50%",
              height: "100%",
              backgroundColor: "#1f2937",
              borderRadius: 2,
            }}
          />
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#6b7280",
              marginBottom: 24,
              lineHeight: 24,
            }}
          >
            Select what you'd like to work on. You can choose multiple goals.
          </Text>

          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              onPress={() => toggleGoal(goal.id)}
              style={{
                padding: 20,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedGoals.includes(goal.id)
                  ? "#1f2937"
                  : "#e5e7eb",
                backgroundColor: selectedGoals.includes(goal.id)
                  ? "#f9fafb"
                  : "#ffffff",
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 28, marginRight: 16 }}>{goal.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  {goal.title}
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#6b7280", lineHeight: 18 }}
                >
                  {goal.description}
                </Text>
              </View>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: selectedGoals.includes(goal.id)
                    ? "#1f2937"
                    : "#d1d5db",
                  backgroundColor: selectedGoals.includes(goal.id)
                    ? "#1f2937"
                    : "#ffffff",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {selectedGoals.includes(goal.id) && (
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
            style={{
              backgroundColor: selectedGoals.length > 0 ? "#1f2937" : "#d1d5db",
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
                color: selectedGoals.length > 0 ? "#ffffff" : "#9ca3af",
                fontSize: 18,
                fontWeight: "600",
                marginRight: 8,
              }}
            >
              Continue
            </Text>
            <ChevronRight
              size={20}
              color={selectedGoals.length > 0 ? "#ffffff" : "#9ca3af"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
