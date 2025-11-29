import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Star,
  Play,
  FileText,
  Calendar,
  Users,
  Clock,
  Lock,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MasterProfilePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [master, setMaster] = useState(null);
  const [content, setContent] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [tier, setTier] = useState("starter");

  useEffect(() => {
    (async () => {
      const savedEmail = await AsyncStorage.getItem("user_email");
      const savedTier = await AsyncStorage.getItem("platform_tier");
      if (savedTier) setTier(savedTier);
      setUserEmail(savedEmail);
      fetchMasterData(savedEmail);
    })();
  }, [id]);

  const fetchMasterData = async (email) => {
    try {
      const qs = email ? `?email=${encodeURIComponent(email)}` : "";
      const response = await fetch(`/api/masters/${id}${qs}`);
      if (!response.ok) throw new Error("Failed to fetch master");
      const data = await response.json();
      setMaster(data.master);
      setContent(data.content);
      setSessions(data.sessions);
    } catch (error) {
      console.error("Error fetching master:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    Alert.prompt(
      "Subscribe with Stripe",
      "Enter your email to subscribe",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async (email) => {
            try {
              const response = await fetch(
                "/api/stripe-checkout-subscription",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    masterId: id,
                    studentEmail: email,
                    tier,
                    redirectURL:
                      process.env.EXPO_PUBLIC_PROXY_BASE_URL ||
                      process.env.EXPO_PUBLIC_BASE_URL,
                  }),
                },
              );

              if (!response.ok) {
                const error = await response.json();
                Alert.alert(
                  "Error",
                  error.error || "Failed to create checkout session",
                );
                return;
              }

              await AsyncStorage.setItem("user_email", email);
              const { url } = await response.json();
              router.push({
                pathname: "/stripe",
                params: {
                  checkoutUrl: url,
                  masterId: id,
                  type: "subscription",
                },
              });
            } catch (error) {
              console.error("Error creating subscription checkout:", error);
              Alert.alert("Error", "Failed to start checkout process");
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleBookSession = (session) => {
    Alert.prompt(
      "Book Session with Payment",
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

              await AsyncStorage.setItem("user_email", email);
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

  if (!master) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 16, color: "#6B7280" }}>Master not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />

      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#000" }}>
          Master Profile
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            padding: 20,
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}
        >
          <Image
            source={{ uri: master.profile_image }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: 16,
            }}
          />
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#000",
              marginBottom: 4,
            }}
          >
            {master.name}
          </Text>
          <Text style={{ fontSize: 16, color: "#6B7280", marginBottom: 12 }}>
            {master.title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Star
              size={20}
              color="#FCD34D"
              fill="#FCD34D"
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#000" }}>
              {master.rating}
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", marginLeft: 4 }}>
              rating
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {master.bio}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: "#000",
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 12,
              width: "100%",
            }}
            onPress={handleSubscribe}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#fff",
                textAlign: "center",
              }}
            >
              Subscribe for ${master.monthly_price}/month
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#000",
              marginBottom: 16,
            }}
          >
            Exclusive Content
          </Text>

          {content.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                opacity: item.accessible ? 1 : 0.6,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                {item.content_type === "video" ? (
                  <Play size={18} color="#000" style={{ marginRight: 8 }} />
                ) : (
                  <FileText size={18} color="#000" style={{ marginRight: 8 }} />
                )}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#000",
                    flex: 1,
                  }}
                >
                  {item.title}
                </Text>
                {!item.is_free && (
                  <View
                    style={{
                      backgroundColor: item.accessible ? "#FCD34D" : "#FEE2E2",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {item.accessible ? (
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "600",
                          color: "#92400E",
                        }}
                      >
                        PREMIUM
                      </Text>
                    ) : (
                      <>
                        <Lock size={12} color="#991B1B" />
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "600",
                            color: "#991B1B",
                            marginLeft: 4,
                          }}
                        >
                          LOCKED
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 14, color: "#6B7280" }}>
                {item.accessible
                  ? item.description
                  : "Subscribe to unlock this content"}
              </Text>
            </View>
          ))}

          {content.length === 0 && (
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                textAlign: "center",
                paddingVertical: 20,
              }}
            >
              No content yet
            </Text>
          )}
        </View>

        <View style={{ padding: 20, paddingTop: 0 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#000",
              marginBottom: 16,
            }}
          >
            Available Sessions
          </Text>

          {sessions.map((session) => (
            <View
              key={session.id}
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
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

              <Text
                style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}
              >
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

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "700", color: "#000" }}
                >
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
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                textAlign: "center",
                paddingVertical: 20,
              }}
            >
              No sessions available
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
