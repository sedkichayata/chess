import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  RotateCcw,
  Activity,
  Trophy,
  Brain,
  Link as LinkIcon,
  BookOpen,
  Target,
  Hourglass,
  AlertTriangle,
  Puzzle,
  Flag,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// added auth imports
import useAuth from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
// react-query for new analysis/history flows
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dimensions } from "react-native";
import { LineGraph } from "react-native-graph";

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [chessUsername, setChessUsername] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");
  // NEW: structured skills from AI
  const [skillResults, setSkillResults] = useState([]);

  const router = useRouter();
  // auth state
  const { signIn, signOut, isReady, isAuthenticated } = useAuth();
  const { data: authedUser, loading: userLoading } = useUser();
  const queryClient = useQueryClient();

  const windowWidth = Dimensions.get("window").width;
  const contentPadding = 20;
  const graphWidth = useMemo(() => {
    const side = contentPadding * 2; // ScrollView horizontal padding
    return Math.max(260, windowWidth - side - 2); // ensure reasonable min width
  }, [windowWidth]);

  useEffect(() => {
    (async () => {
      const savedEmail = await AsyncStorage.getItem("user_email");
      if (savedEmail) {
        setEmail(savedEmail);
        fetchProfile(savedEmail);
      }
    })();
  }, []);

  // when auth is ready and we have a user, sync their email into the local state
  useEffect(() => {
    if (isReady && authedUser?.email) {
      setEmail(authedUser.email);
      AsyncStorage.setItem("user_email", authedUser.email).catch(() => {});
      fetchProfile(authedUser.email);
    }
  }, [isReady, authedUser?.email]);

  const fetchProfile = async (emailToFetch) => {
    try {
      const res = await fetch(
        `/api/users?email=${encodeURIComponent(emailToFetch)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUserProfile(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLinkChessAccount = async () => {
    if (!email || !chessUsername) {
      Alert.alert("Error", "Please enter your email and chess.com username");
      return;
    }

    setIsLinking(true);
    try {
      const res = await fetch("/api/chesscom/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username: chessUsername }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUserProfile(data.user);
        setChessUsername("");
        Alert.alert("Success", "Your Chess.com account has been linked!");
      } else {
        Alert.alert("Error", data.error || "Failed to link account");
      }
    } catch (e) {
      Alert.alert("Error", "An error occurred while linking account");
    } finally {
      setIsLinking(false);
    }
  };

  const handleFetchGames = async () => {
    if (!userProfile?.chesscom_username) {
      Alert.alert("No Username", "Link your chess.com account to view games.");
      return;
    }
    try {
      const res = await fetch(
        `/api/chesscom/${userProfile.chesscom_username}/games`,
      );
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch (e) {
      Alert.alert("Error", "Could not fetch games");
    }
  };

  const handleAnalyze = async () => {
    if (!userProfile?.chesscom_username) return;
    setAnalyzing(true);
    setAnalysis("");
    setSkillResults([]);
    try {
      const res = await fetch("/api/chesscom/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userProfile.chesscom_username }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.analysis) setAnalysis(data.analysis);
        if (Array.isArray(data.skills)) setSkillResults(data.skills);
      } else {
        Alert.alert(
          "Analysis Failed",
          data.error || "Could not analyze games.",
        );
      }
    } catch (e) {
      Alert.alert("Error", "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  // Save current snapshot of skills
  const saveSnapshotMutation = useMutation({
    mutationFn: async () => {
      if (!email || !Array.isArray(skillResults) || skillResults.length === 0) {
        throw new Error("Nothing to save");
      }
      const res = await fetch("/api/analysis/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username: userProfile?.chesscom_username,
          skills: skillResults,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skillHistory", email] });
      Alert.alert("Saved", "Your skill snapshot was saved.");
    },
    onError: () => {
      Alert.alert("Error", "Could not save snapshot");
    },
  });

  // Fetch history using react-query
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["skillHistory", email],
    enabled: !!email,
    queryFn: async () => {
      const res = await fetch(
        `/api/analysis/skills?email=${encodeURIComponent(email)}`,
      );
      if (!res.ok) {
        throw new Error("Failed to load history");
      }
      return res.json();
    },
    staleTime: 1000 * 60, // 1 min
  });

  const skillsHistory = historyData?.skills || [];

  const renderSkillIcon = (iconName) => {
    switch (iconName) {
      case "BookOpen":
        return (
          <BookOpen size={20} color="#111827" style={{ marginRight: 10 }} />
        );
      case "Target":
        return <Target size={20} color="#111827" style={{ marginRight: 10 }} />;
      case "Hourglass":
        return (
          <Hourglass size={20} color="#111827" style={{ marginRight: 10 }} />
        );
      case "AlertTriangle":
        return (
          <AlertTriangle
            size={20}
            color="#111827"
            style={{ marginRight: 10 }}
          />
        );
      case "Puzzle":
        return <Puzzle size={20} color="#111827" style={{ marginRight: 10 }} />;
      case "Flag":
        return <Flag size={20} color="#111827" style={{ marginRight: 10 }} />;
      default:
        return <Brain size={20} color="#111827" style={{ marginRight: 10 }} />;
    }
  };

  const renderProgressBar = (score) => {
    const widthPct = Math.max(0, Math.min(100, Number(score || 0)));
    return (
      <View
        style={{
          width: "100%",
          height: 10,
          backgroundColor: "#E5E7EB",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${widthPct}%`,
            height: "100%",
            backgroundColor:
              widthPct >= 70
                ? "#10B981"
                : widthPct >= 40
                  ? "#F59E0B"
                  : "#EF4444",
          }}
        />
      </View>
    );
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      "Reset Onboarding",
      "This will restart the onboarding process. You can choose a different master or update your preferences.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("onboarding_completed");
              router.replace("/onboarding/welcome");
            } catch (error) {
              console.error("Error resetting onboarding:", error);
              Alert.alert("Error", "Failed to reset onboarding");
            }
          },
        },
      ],
    );
  };

  const handleViewBookings = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      const response = await fetch(
        `/api/bookings?email=${encodeURIComponent(email)}`,
      );
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();

      if (data.bookings.length === 0) {
        Alert.alert("No Bookings", "You have no bookings yet");
      } else {
        const bookingsList = data.bookings
          .map(
            (b) =>
              `${b.title} - ${new Date(b.scheduled_at).toLocaleDateString()}`,
          )
          .join("\n");
        Alert.alert("Your Bookings", bookingsList);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to fetch bookings");
    }
  };

  const handleViewSubscriptions = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      const response = await fetch(
        `/api/subscriptions?email=${encodeURIComponent(email)}`,
      );
      if (!response.ok) throw new Error("Failed to fetch subscriptions");
      const data = await response.json();

      if (data.subscriptions.length === 0) {
        Alert.alert("No Subscriptions", "You have no active subscriptions");
      } else {
        const subsList = data.subscriptions
          .map((s) => `${s.name} - $${s.monthly_price}/mo`)
          .join("\n");
        Alert.alert("Your Subscriptions", subsList);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      Alert.alert("Error", "Failed to fetch subscriptions");
    }
  };

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
          Profile
        </Text>
        <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 4 }}>
          Manage your account
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          padding: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#E5E7EB",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <User size={40} color="#6B7280" />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#000",
              marginBottom: 4,
            }}
          >
            {userProfile?.name || "Chess Student"}
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>
            {userProfile?.chesscom_username
              ? `@${userProfile.chesscom_username}`
              : "Link your Chess.com account below"}
          </Text>

          {/* Auth button */}
          <View style={{ marginTop: 16, width: "100%" }}>
            {!isReady || userLoading ? (
              <View
                style={{
                  backgroundColor: "#111827",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: 0.8,
                }}
              >
                <ActivityIndicator color="#fff" />
                <Text
                  style={{ color: "#fff", marginTop: 8, fontWeight: "600" }}
                >
                  Checking account...
                </Text>
              </View>
            ) : isAuthenticated ? (
              <TouchableOpacity
                onPress={() => {
                  try {
                    signOut();
                  } catch (e) {
                    Alert.alert("Error", "Could not sign out");
                  }
                }}
                style={{
                  backgroundColor: "#111827",
                  padding: 12,
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
                    Alert.alert("Error", "Could not start sign in");
                  }
                }}
                style={{
                  backgroundColor: "#111827",
                  padding: 12,
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

        {/* Ratings Card */}
        {userProfile &&
          (userProfile.chess_rapid_elo || userProfile.chess_blitz_elo) && (
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#EFF6FF",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Trophy size={20} color="#2563EB" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 12, color: "#1E40AF" }}>Rapid</Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#1E3A8A",
                  }}
                >
                  {userProfile.chess_rapid_elo || "-"}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#FEF2F2",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Activity
                  size={20}
                  color="#DC2626"
                  style={{ marginBottom: 4 }}
                />
                <Text style={{ fontSize: 12, color: "#991B1B" }}>Blitz</Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#7F1D1D",
                  }}
                >
                  {userProfile.chess_blitz_elo || "-"}
                </Text>
              </View>
            </View>
          )}

        {/* Link Chess.com Account Section - Show only if not linked */}
        {!userProfile?.chesscom_username && (
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#000",
                marginBottom: 8,
              }}
            >
              Link Chess.com Account
            </Text>
            <View style={{ gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F9FAFB",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 14,
                }}
              >
                <LinkIcon
                  size={20}
                  color="#6B7280"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  style={{ flex: 1, fontSize: 16, color: "#000" }}
                  placeholder="Chess.com Username"
                  placeholderTextColor="#9CA3AF"
                  value={chessUsername}
                  onChangeText={setChessUsername}
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                onPress={handleLinkChessAccount}
                disabled={isLinking}
                style={{
                  backgroundColor: "#059669",
                  padding: 14,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                {isLinking ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Link Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Your Email
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F9FAFB",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 14,
            }}
          >
            <Mail size={20} color="#6B7280" style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, fontSize: 16, color: "#000" }}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* My Bookings */}
        <TouchableOpacity
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={handleViewBookings}
        >
          <Calendar size={24} color="#000" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
              My Bookings
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              View your scheduled sessions
            </Text>
          </View>
        </TouchableOpacity>

        {/* My Subscriptions */}
        <TouchableOpacity
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={handleViewSubscriptions}
        >
          <CreditCard size={24} color="#000" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
              My Subscriptions
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              Manage your subscriptions
            </Text>
          </View>
        </TouchableOpacity>

        {/* Game Analysis */}
        {userProfile?.chesscom_username && (
          <View style={{ marginBottom: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={async () => {
                if (games.length === 0) await handleFetchGames();
                // Toggle view or nav to games page - for now just expand inline
              }}
            >
              <Brain size={24} color="#7C3AED" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#000" }}
                >
                  AI Coach Analysis
                </Text>
                <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                  Analyze your recent games
                </Text>
              </View>
            </TouchableOpacity>

            {games.length > 0 && (
              <View
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                  Recent Games ({games.length})
                </Text>
                {games.slice(0, 3).map((g, i) => (
                  <Text
                    key={i}
                    style={{ fontSize: 12, color: "#4B5563", marginBottom: 4 }}
                  >
                    {g.white === userProfile.chesscom_username ? "⬜" : "⬛"} vs{" "}
                    {g.white === userProfile.chesscom_username
                      ? g.black
                      : g.white}{" "}
                    (
                    {g.white === userProfile.chesscom_username
                      ? g.white_result
                      : g.black_result}
                    )
                  </Text>
                ))}

                <TouchableOpacity
                  onPress={handleAnalyze}
                  disabled={analyzing}
                  style={{
                    backgroundColor: "#7C3AED",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "600",
                    }}
                  >
                    {analyzing
                      ? "Analyzing..."
                      : "Analyze Weaknesses (Last 50 games)"}
                  </Text>
                </TouchableOpacity>

                {/* NEW: Structured skill results */}
                {skillResults.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        marginBottom: 8,
                        color: "#111827",
                      }}
                    >
                      Skills Overview
                    </Text>
                    <View style={{ gap: 10 }}>
                      {skillResults.map((s, idx) => (
                        <View
                          key={`${s.key || s.label || idx}`}
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: 10,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: "#E5E7EB",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            {renderSkillIcon(s.icon)}
                            <Text
                              style={{
                                fontSize: 15,
                                fontWeight: "600",
                                color: "#111827",
                                flex: 1,
                              }}
                            >
                              {s.label || s.key}
                            </Text>
                            <Text style={{ fontSize: 13, color: "#374151" }}>
                              {Math.round(s.score ?? 0)}/100
                            </Text>
                          </View>
                          {renderProgressBar(s.score)}
                          {!!s.tip && (
                            <Text
                              style={{
                                fontSize: 12,
                                color: "#6B7280",
                                marginTop: 6,
                              }}
                            >
                              {s.tip}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      onPress={() => saveSnapshotMutation.mutate()}
                      disabled={saveSnapshotMutation.isLoading}
                      style={{
                        backgroundColor: "#111827",
                        padding: 12,
                        borderRadius: 8,
                        alignItems: "center",
                        marginTop: 12,
                      }}
                    >
                      {saveSnapshotMutation.isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                          Save snapshot
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Keep textual summary for context */}
                {analysis ? (
                  <View
                    style={{
                      marginTop: 12,
                      padding: 12,
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: "#7C3AED",
                    }}
                  >
                    <Text style={{ color: "#374151", lineHeight: 20 }}>
                      {analysis}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        )}

        {/* History graphs */}
        {email ? (
          <View style={{ marginTop: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Skill History
            </Text>
            {historyLoading ? (
              <ActivityIndicator color="#111827" />
            ) : skillsHistory.length === 0 ? (
              <Text style={{ color: "#6B7280" }}>
                No snapshots yet. Analyze and save to start tracking.
              </Text>
            ) : (
              <View style={{ gap: 16 }}>
                {skillsHistory.map((sk) => {
                  const points = (sk.points || []).map((p) => ({
                    date: new Date(p.date),
                    value: Number(p.value || 0),
                  }));
                  return (
                    <View
                      key={sk.key}
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        {renderSkillIcon(null)}
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {sk.label || sk.key}
                        </Text>
                      </View>
                      <LineGraph
                        points={points}
                        color="#7C3AED"
                        animated={true}
                        enablePanGesture={true}
                        width={graphWidth}
                        height={160}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        <TouchableOpacity
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={handleResetOnboarding}
        >
          <RotateCcw size={24} color="#f59e0b" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#f59e0b" }}>
              Reset Onboarding
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
              Restart the setup process or change masters
            </Text>
          </View>
        </TouchableOpacity>

        <View
          style={{
            marginTop: 20,
            padding: 16,
            backgroundColor: "#FEF3C7",
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#92400E",
              marginBottom: 4,
            }}
          >
            💡 Pro Tip
          </Text>
          <Text style={{ fontSize: 13, color: "#92400E" }}>
            Subscribe to your favorite masters to unlock exclusive content and
            get priority booking for sessions!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
