import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Check } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Plan() {
  const router = useRouter();
  const [tier, setTier] = useState("starter");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) {
          setPlans(data.plans);
          // Default to first paid plan if available, or first plan
          const defaultPlan =
            data.plans.find((p) => p.price_cents > 0) || data.plans[0];
          if (defaultPlan) setTier(defaultPlan.tier);
        }
      })
      .catch((err) => console.error("Failed to load plans:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = async () => {
    await AsyncStorage.setItem("platform_tier", tier);
    router.push("/onboarding/masters");
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading plans...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            paddingHorizontal: 24,
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
              Choose your plan
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
              Flexible options for every level
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 4,
            backgroundColor: "#f3f4f6",
            marginHorizontal: 24,
            borderRadius: 2,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: "80%",
              height: "100%",
              backgroundColor: "#1f2937",
              borderRadius: 2,
            }}
          />
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {plans.map((t) => (
            <TouchableOpacity
              key={t.tier}
              onPress={() => setTier(t.tier)}
              style={{
                borderWidth: 2,
                borderColor: tier === t.tier ? "#1f2937" : "#e5e7eb",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111827",
                      textTransform: "capitalize",
                    }}
                  >
                    {t.tier}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}
                  >
                    {t.description || "Access to platform features"}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {t.price_cents === 0
                      ? "Free"
                      : `$${(t.price_cents / 100).toFixed(2)}/mo`}
                  </Text>
                  {tier === t.tier && (
                    <View
                      style={{
                        marginTop: 6,
                        backgroundColor: "#111827",
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 12 }}>
                        Selected
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View
            style={{
              backgroundColor: "#ECFDF5",
              borderRadius: 12,
              padding: 12,
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Check size={16} color="#059669" />
            <Text style={{ marginLeft: 8, color: "#065F46" }}>
              Access to free content & analysis
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <TouchableOpacity
            onPress={handleContinue}
            style={{
              backgroundColor: "#1f2937",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
