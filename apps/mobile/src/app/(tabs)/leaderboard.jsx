import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Trophy, User, Medal } from "lucide-react-native";

export default function LeaderboardPage() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("rapid");

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?type=${filter}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return "#FFD700"; // Gold
      case 1:
        return "#C0C0C0"; // Silver
      case 2:
        return "#CD7F32"; // Bronze
      default:
        return "#6B7280"; // Gray
    }
  };

  const renderItem = ({ item, index }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <View
        style={{
          width: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {index < 3 ? (
          <Medal size={24} color={getRankColor(index)} />
        ) : (
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#6B7280" }}>
            {index + 1}
          </Text>
        )}
      </View>

      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#F3F4F6",
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: 12,
        }}
      >
        <User size={20} color="#9CA3AF" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
          {item.name || "Anonymous"}
        </Text>
        <Text style={{ fontSize: 13, color: "#6B7280" }}>
          {item.chesscom_username
            ? `@${item.chesscom_username}`
            : "No username"}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>
          {item.elo}
        </Text>
        <Text style={{ fontSize: 12, color: "#6B7280" }}>ELO</Text>
      </View>
    </View>
  );

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
          Leaderboard
        </Text>
        <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 4 }}>
          Top players in the community
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 8,
        }}
      >
        {["rapid", "blitz", "bullet"].map((type) => (
          <TouchableOpacity
            key={type}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: filter === type ? "#000" : "#F3F4F6",
            }}
            onPress={() => setFilter(type)}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: filter === type ? "#fff" : "#6B7280",
                textAlign: "center",
                textTransform: "capitalize",
              }}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Trophy size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
              <Text
                style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}
              >
                No rankings available yet
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
