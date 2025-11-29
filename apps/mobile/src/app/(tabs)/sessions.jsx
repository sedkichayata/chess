import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Calendar, Users, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import useAuth from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";

export default function SessionsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { signIn, signOut, isReady, isAuthenticated } = useAuth();
  const { loading: userLoading } = useUser();

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      const url =
        filter === "all" ? "/api/sessions" : `/api/sessions?type=${filter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBookSession = (session) => {
    Alert.prompt(
      "Book Session",
      `Book "${session.title}" for $${session.price}?\n\nEnter your email:`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue to Payment",
          onPress: async (email) => {
            try {
              const response = await fetch("/api/stripe-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: session.id,
                  studentEmail: email,
                  redirectURL:
                    process.env.EXPO_PUBLIC_PROXY_BASE_URL ||
                    process.env.EXPO_PUBLIC_BASE_URL,
                }),
              });

              if (!response.ok) {
                const error = await response.json();
                Alert.alert(
                  "Error",
                  error.error || "Failed to create checkout session",
                );
                return;
              }

              const { url } = await response.json();
              router.push({
                pathname: "/stripe",
                params: {
                  checkoutUrl: url,
                  sessionId: session.id,
                  type: "booking",
                },
              });
            } catch (error) {
              console.error("Error creating booking checkout:", error);
              Alert.alert("Error", "Failed to start checkout process");
            }
          },
        },
      ],
      "plain-text",
    );
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: "#000" }}>
              Sessions
            </Text>
            <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 4 }}>
              Book your lessons
            </Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            {!isReady || userLoading ? (
              <View
                style={{
                  backgroundColor: "#111827",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: 0.85,
                }}
              >
                <ActivityIndicator color="#fff" />
              </View>
            ) : isAuthenticated ? (
              <TouchableOpacity
                onPress={() => {
                  try {
                    signOut();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                style={{
                  backgroundColor: "#111827",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Sign out
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  try {
                    signIn();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                style={{
                  backgroundColor: "#111827",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Sign in
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 8,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: filter === "all" ? "#000" : "#F3F4F6",
          }}
          onPress={() => setFilter("all")}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: filter === "all" ? "#fff" : "#6B7280",
              textAlign: "center",
            }}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: filter === "group" ? "#000" : "#F3F4F6",
          }}
          onPress={() => setFilter("group")}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: filter === "group" ? "#fff" : "#6B7280",
              textAlign: "center",
            }}
          >
            Group
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: filter === "individual" ? "#000" : "#F3F4F6",
          }}
          onPress={() => setFilter("individual")}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: filter === "individual" ? "#fff" : "#6B7280",
              textAlign: "center",
            }}
          >
            1-on-1
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {sessions.map((session) => (
          <View
            key={session.id}
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Calendar size={18} color="#000" style={{ marginRight: 8 }} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#000",
                  flex: 1,
                }}
              >
                {session.title}
              </Text>
            </View>

            <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>
              with {session.master_name}
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
              {session.description}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              {session.session_type === "group" ? (
                <Users size={16} color="#6B7280" style={{ marginRight: 6 }} />
              ) : (
                <Users size={16} color="#6B7280" style={{ marginRight: 6 }} />
              )}
              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  textTransform: "capitalize",
                  marginRight: 16,
                }}
              >
                {session.session_type}
              </Text>

              <Clock size={16} color="#6B7280" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                {session.duration_minutes} min
              </Text>
            </View>

            {session.scheduled_at && (
              <Text
                style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}
              >
                📅 {formatDate(session.scheduled_at)}
              </Text>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#000" }}>
                ${session.price}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#000",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
                onPress={() => handleBookSession(session)}
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}
                >
                  Book Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {sessions.length === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text
              style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}
            >
              No sessions available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
