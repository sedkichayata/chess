import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Compass,
  Hourglass,
  Trophy,
  Lock,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";

export default function ClubDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user } = useUser();

  const [club, setClub] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [expandedTrack, setExpandedTrack] = useState(null);

  useEffect(() => {
    if (id && user?.id) {
      fetchDetails();
    } else if (id) {
      fetchDetails(); // fetch even if no user, just won't show membership
    }
  }, [id, user]);

  const fetchDetails = async () => {
    try {
      const url = user?.id
        ? `/api/clubs/${id}?userId=${user.id}`
        : `/api/clubs/${id}`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setClub(data.club);
        setTracks(data.tracksWithContent || []);
        setMembership(data.membership);
      } else {
        Alert.alert("Error", data.error || "Failed to load club");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load club");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to join a club.");
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`/api/clubs/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.requires_payment) {
          Alert.alert(
            "Payment Required",
            data.message || "This club requires a subscription.",
          );
          // TODO: Redirect to payment flow
        } else {
          Alert.alert("Success", "You have joined the club!");
          fetchDetails(); // Refresh to get membership
        }
      } else {
        Alert.alert("Error", data.message || data.error || "Failed to join");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to join club");
    } finally {
      setJoining(false);
    }
  };

  const renderIcon = (name, size = 24, color = "#111827") => {
    switch (name) {
      case "BookOpen":
        return <BookOpen size={size} color={color} />;
      case "Brain":
        return <Brain size={size} color={color} />;
      case "Compass":
        return <Compass size={size} color={color} />;
      case "Hourglass":
        return <Hourglass size={size} color={color} />;
      case "Trophy":
        return <Trophy size={size} color={color} />;
      default:
        return <BookOpen size={size} color={color} />;
    }
  };

  const toggleTrack = (trackId) => {
    if (expandedTrack === trackId) {
      setExpandedTrack(null);
    } else {
      setExpandedTrack(trackId);
    }
  };

  const openContent = (item) => {
    if (item.is_locked && !membership) {
      Alert.alert("Locked", "Join the club to access this content.");
      return;
    }
    if (item.url) {
      Linking.openURL(item.url);
    } else if (item.body_text) {
      Alert.alert(item.title, item.body_text);
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
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (!club) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text>Club not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: "#111827" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isMember = !!membership && membership.status === "active";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="light" />

      {/* Header Image */}
      <View style={{ height: 240, width: "100%", position: "relative" }}>
        {club.cover_image_url ? (
          <Image
            source={{ uri: club.cover_image_url }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#111827",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Trophy size={64} color="#374151" />
          </View>
        )}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        />

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 10,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>

        <View style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 4,
            }}
          >
            {club.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {club.is_verified && (
              <CheckCircle
                size={16}
                color="#34D399"
                style={{ marginRight: 6 }}
              />
            )}
            <Text style={{ fontSize: 14, color: "#D1D5DB" }}>
              by {club.master_name || "Chess Master"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {/* Description & Action */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#374151",
              lineHeight: 24,
              marginBottom: 16,
            }}
          >
            {club.description}
          </Text>

          {!isMember ? (
            <TouchableOpacity
              onPress={handleJoin}
              disabled={joining}
              style={{
                backgroundColor: "#111827",
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              {joining ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                >
                  {club.monthly_price_cents > 0
                    ? `Join for $${(club.monthly_price_cents / 100).toFixed(2)}/mo`
                    : "Join for Free"}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View
              style={{
                backgroundColor: "#ECFDF5",
                padding: 12,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle
                size={20}
                color="#059669"
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "#065F46", fontWeight: "600" }}>
                You are a member
              </Text>
            </View>
          )}
        </View>

        {/* Tracks */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 16,
          }}
        >
          Learning Tracks
        </Text>

        <View style={{ gap: 16 }}>
          {tracks.map((track) => (
            <View
              key={track.id}
              style={{
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={() => toggleTrack(track.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  backgroundColor: "#F9FAFB",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  {renderIcon(track.icon_name)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {track.title}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280" }}
                    numberOfLines={1}
                  >
                    {track.description}
                  </Text>
                </View>
                {expandedTrack === track.id ? (
                  <ChevronUp size={20} color="#6B7280" />
                ) : (
                  <ChevronDown size={20} color="#6B7280" />
                )}
              </TouchableOpacity>

              {expandedTrack === track.id && (
                <View
                  style={{
                    padding: 16,
                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB",
                  }}
                >
                  <Text
                    style={{ fontSize: 14, color: "#4B5563", marginBottom: 12 }}
                  >
                    {track.description}
                  </Text>

                  {track.content && track.content.length > 0 ? (
                    <View style={{ gap: 10 }}>
                      {track.content.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => openContent(item)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 10,
                            backgroundColor: "#F3F4F6",
                            borderRadius: 8,
                          }}
                        >
                          {item.is_locked && !isMember ? (
                            <Lock
                              size={16}
                              color="#6B7280"
                              style={{ marginRight: 10 }}
                            />
                          ) : item.type === "video" ? (
                            <PlayCircle
                              size={16}
                              color="#7C3AED"
                              style={{ marginRight: 10 }}
                            />
                          ) : (
                            <FileText
                              size={16}
                              color="#2563EB"
                              style={{ marginRight: 10 }}
                            />
                          )}
                          <Text
                            style={{
                              flex: 1,
                              fontSize: 14,
                              color:
                                item.is_locked && !isMember
                                  ? "#9CA3AF"
                                  : "#111827",
                            }}
                          >
                            {item.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#9CA3AF",
                        fontStyle: "italic",
                      }}
                    >
                      No content yet.
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
