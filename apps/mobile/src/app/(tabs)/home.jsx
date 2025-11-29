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
import { Play, FileText, Lock, Brain, Crown, Users } from "lucide-react-native";
import { useRouter, Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
// ADD: auth hooks for sign in/out and user state
import useAuth from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  // ADD: auth state
  const { signIn, signOut, isReady, isAuthenticated } = useAuth();
  const { data: authedUser, loading: userLoading } = useUser();

  useEffect(() => {
    (async () => {
      const savedEmail = await AsyncStorage.getItem("user_email");
      await fetchContent(savedEmail);
    })();
  }, []);

  const fetchContent = async (email) => {
    try {
      const qs = email ? `?email=${encodeURIComponent(email)}` : "";
      const response = await fetch(`/api/content${qs}`);
      if (!response.ok) throw new Error("Failed to fetch content");
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickBtnStyle = {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  };

  const quickBtnText = {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
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
        {/* CHANGED: header to include a right-aligned auth button */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: "bold", color: "#000" }}>
            ChessMasters
          </Text>
          {/* Auth button inline in header */}
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
        {/* existing subtitle */}
        <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 4 }}>
          Exclusive chess content
        </Text>

        {/* Quick actions row */}
        <ScrollView
          horizontal
          style={{ flexGrow: 0, marginTop: 12 }}
          contentContainerStyle={{ paddingRight: 20 }}
          showsHorizontalScrollIndicator={false}
        >
          <Link href="/(tabs)/sessions" asChild>
            <TouchableOpacity
              onPress={() => Haptics.selectionAsync()}
              style={quickBtnStyle}
              accessibilityLabel="Play now (Sessions)"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Play size={18} color="#111827" />
              <Text style={quickBtnText}>Play now</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/plus/analysis" asChild>
            <TouchableOpacity
              onPress={() => Haptics.selectionAsync()}
              style={quickBtnStyle}
              accessibilityLabel="Analyze game"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Brain size={18} color="#111827" />
              <Text style={quickBtnText}>Analyze game</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/masters" asChild>
            <TouchableOpacity
              onPress={() => Haptics.selectionAsync()}
              style={quickBtnStyle}
              accessibilityLabel="Open Masters"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Crown size={18} color="#111827" />
              <Text style={quickBtnText}>Masters</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/clubs" asChild>
            <TouchableOpacity
              onPress={() => Haptics.selectionAsync()}
              style={quickBtnStyle}
              accessibilityLabel="Open Clubs"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Users size={18} color="#111827" />
              <Text style={quickBtnText}>Clubs</Text>
            </TouchableOpacity>
          </Link>
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {content.map((item) => (
          <View
            key={item.id}
            style={{
              marginHorizontal: 20,
              marginTop: 20,
              backgroundColor: "#F9FAFB",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: item.thumbnail_url }}
              style={{
                width: "100%",
                height: 200,
                opacity: item.accessible ? 1 : 0.5,
              }}
              resizeMode="cover"
            />

            <View style={{ padding: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Image
                  source={{ uri: item.master_image }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    marginRight: 8,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: "#000" }}
                  >
                    {item.master_name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6B7280" }}>
                    {item.master_title}
                  </Text>
                </View>
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
                          fontSize: 11,
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
                            fontSize: 11,
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

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#000",
                  marginBottom: 6,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{ fontSize: 14, color: "#6B7280", marginBottom: 12 }}
              >
                {item.accessible
                  ? item.description
                  : "Subscribe to unlock this content"}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {item.content_type === "video" ? (
                  <Play size={16} color="#6B7280" style={{ marginRight: 6 }} />
                ) : (
                  <FileText
                    size={16}
                    color="#6B7280"
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    textTransform: "capitalize",
                  }}
                >
                  {item.content_type}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {content.length === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text
              style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}
            >
              No content available yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
