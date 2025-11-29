import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Redirect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem(
        "onboarding_completed",
      );
      setHasCompletedOnboarding(onboardingCompleted === "true");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setHasCompletedOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <Text style={{ fontSize: 16, color: "#6b7280" }}>Loading...</Text>
      </View>
    );
  }

  // Change the first screen to the Profile page regardless of onboarding state
  return <Redirect href="/(tabs)/plus/profile" />;
}
