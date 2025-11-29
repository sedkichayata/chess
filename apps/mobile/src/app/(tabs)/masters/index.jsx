import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Star, TrendingUp } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function MastersPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const response = await fetch("/api/masters");
      if (!response.ok) throw new Error("Failed to fetch masters");
      const data = await response.json();
      setMasters(data.masters);
    } catch (error) {
      console.error("Error fetching masters:", error);
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
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

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
        <Text style={{ fontSize: 32, fontWeight: "bold", color: "#000" }}>
          Chess Masters
        </Text>
        <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 4 }}>
          Learn from the best
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {masters.map((master) => (
          <TouchableOpacity
            key={master.id}
            style={{
              marginHorizontal: 20,
              marginTop: 20,
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
            }}
            activeOpacity={0.7}
            onPress={() => router.push(`/(tabs)/masters/${master.id}`)}
          >
            <Image
              source={{ uri: master.profile_image }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginRight: 16,
              }}
            />

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 4,
                }}
              >
                {master.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
                {master.title}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Star
                  size={16}
                  color="#FCD34D"
                  fill="#FCD34D"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#000" }}
                >
                  {master.rating}
                </Text>
                <Text style={{ fontSize: 13, color: "#6B7280", marginLeft: 4 }}>
                  rating
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#000" }}
                >
                  ${master.monthly_price}/mo
                </Text>
                <View
                  style={{
                    backgroundColor: "#000",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}
                  >
                    View Profile
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
