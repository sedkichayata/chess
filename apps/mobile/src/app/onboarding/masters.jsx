import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  Star,
  DollarSign,
  CheckCircle,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Masters() {
  const [mode, setMode] = useState("masters"); // "masters" | "clubs"
  const [masters, setMasters] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
  const [tier, setTier] = useState("starter");
  const [subscribing, setSubscribing] = useState(false);
  const [eloData, setEloData] = useState(null);
  const [linked, setLinked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
    (async () => {
      const savedTier = await AsyncStorage.getItem("platform_tier");
      if (savedTier) setTier(savedTier);

      const savedEmail = await AsyncStorage.getItem("user_email");
      if (savedEmail) setEmail(savedEmail);

      const savedElo = await AsyncStorage.getItem("onboarding_elo");
      if (savedElo) {
        setEloData(JSON.parse(savedElo));
      }
    })();
  }, []);

  const fetchData = async () => {
    try {
      const [mastersRes, clubsRes] = await Promise.all([
        fetch("/api/masters"),
        fetch("/api/clubs"),
      ]);

      if (mastersRes.ok) {
        const md = await mastersRes.json();
        setMasters(md.masters || []);
      }
      if (clubsRes.ok) {
        const cd = await clubsRes.json();
        setClubs(cd.clubs || []);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const linkEloData = async (userEmail) => {
    if (!eloData) return;

    try {
      if (eloData.source === "chesscom" && eloData.username) {
        await fetch("/api/chesscom/link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            username: eloData.username,
          }),
        });
        setLinked(true);
      } else if (eloData.source === "manual" || eloData.ratings) {
        await fetch("/api/users/elo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            rapid: eloData.ratings?.rapid,
            blitz: eloData.ratings?.blitz,
            bullet: eloData.ratings?.bullet,
          }),
        });
        setLinked(true);
      }
    } catch (e) {
      console.error("Failed to link ELO:", e);
    }
  };

  const startCheckout = async (url) => {
    await AsyncStorage.setItem("user_email", email.trim());
    router.push({ pathname: "/stripe", params: { checkoutUrl: url } });
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setSubscribing(true);
    try {
      // Link ELO first
      await linkEloData(email.trim());

      if (mode === "masters") {
        if (!selectedMaster) {
          Alert.alert("Select a Master", "Please select a master.");
          setSubscribing(false);
          return;
        }

        const response = await fetch("/api/stripe-checkout-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            masterId: selectedMaster.id,
            studentEmail: email.trim(),
            tier,
            referralCode: referral || undefined,
            redirectURL: `${process.env.EXPO_PUBLIC_PROXY_BASE_URL || process.env.EXPO_PUBLIC_BASE_URL}/onboarding/success`,
          }),
        });
        const data = await response.json();

        if (response.ok && data.success) {
          router.push("/onboarding/success");
          return;
        }
        if (response.ok && data.url) {
          await startCheckout(data.url);
        } else {
          throw new Error(data.error || "Payment setup failed");
        }
      } else {
        // Clubs flow
        if (!selectedClub) {
          Alert.alert("Select a Club", "Please select a club.");
          setSubscribing(false);
          return;
        }

        // Try to resolve user id from email
        let userId = null;
        try {
          const ures = await fetch(
            `/api/users?email=${encodeURIComponent(email.trim())}`,
          );
          if (ures.ok) {
            const ud = await ures.json();
            userId = ud?.user?.id || null;
          }
        } catch (e) {
          // ignore, will handle null userId below
        }

        if (!userId) {
          Alert.alert(
            "Account Needed",
            "We couldn't find your account yet. Please finish platform signup first or sign in, then join the club from the Clubs tab.",
          );
          setSubscribing(false);
          return;
        }

        const joinRes = await fetch(`/api/clubs/${selectedClub.id}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        const joinData = await joinRes.json();

        if (!joinRes.ok) {
          throw new Error(joinData.error || "Failed to join club");
        }

        if (joinData.requires_payment) {
          Alert.alert(
            "Payment Required",
            "This club requires a paid membership. We'll take you to the club page to finish payment.",
            [
              {
                text: "OK",
                onPress: () => router.replace(`/clubs/${selectedClub.id}`),
              },
            ],
          );
        } else {
          router.push("/onboarding/success");
        }
      }
    } catch (error) {
      console.error("Subscribe/join error:", error);
      Alert.alert(
        "Error",
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setSubscribing(false);
    }
  };

  const handlePlatformOnly = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    setSubscribing(true);
    try {
      // Link ELO first
      await linkEloData(email.trim());

      const resp = await fetch("/api/stripe-checkout-platform-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: email.trim(),
          tier,
          referralCode: referral || undefined,
          redirectURL: `${process.env.EXPO_PUBLIC_PROXY_BASE_URL || process.env.EXPO_PUBLIC_BASE_URL}/onboarding/success`,
        }),
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        router.push("/onboarding/success");
        return;
      }

      if (resp.ok && data.url) {
        await startCheckout(data.url);
      } else {
        throw new Error(data.error || "Payment setup failed");
      }
    } catch (error) {
      console.error("Platform subscription error:", error);
      Alert.alert(
        "Error",
        error.message || "Could not start platform subscription.",
      );
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <StatusBar style="dark" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, color: "#6b7280" }}>
            Loading options...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isClubPaid = (club) => Number(club?.monthly_price_cents || 0) > 0;
  const formatClubPrice = (club) => {
    const cents = Number(club?.monthly_price_cents || 0);
    return `$${(cents / 100).toFixed(2)}/month`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar style="dark" />

      <View style={{ flex: 1 }}>
        {/* Header */}
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
              Choose a master or a club
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
              Plan: {tier.toUpperCase()} • 30-day free trial
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            height: 4,
            backgroundColor: "#f3f4f6",
            marginHorizontal: 24,
            borderRadius: 2,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#1f2937",
              borderRadius: 2,
            }}
          />
        </View>

        {/* Toggle */}
        <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
          <View
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 10,
              padding: 4,
              flexDirection: "row",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setMode("masters");
                setSelectedClub(null);
              }}
              style={{
                flex: 1,
                backgroundColor: mode === "masters" ? "#111827" : "transparent",
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: mode === "masters" ? "#fff" : "#111827",
                  fontWeight: "600",
                }}
              >
                Masters
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMode("clubs");
                setSelectedMaster(null);
              }}
              style={{
                flex: 1,
                backgroundColor: mode === "clubs" ? "#111827" : "transparent",
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: mode === "clubs" ? "#fff" : "#111827",
                  fontWeight: "600",
                }}
              >
                Clubs
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Email Input */}
          <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: "#ffffff",
              }}
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {linked && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <CheckCircle size={14} color="#059669" />
                <Text style={{ marginLeft: 6, fontSize: 13, color: "#059669" }}>
                  {eloData?.source === "chesscom"
                    ? `Linked to ${eloData.username}`
                    : "Ratings saved"}
                </Text>
              </View>
            )}
          </View>

          {/* Referral Input */}
          <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Referral code (optional)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                backgroundColor: "#ffffff",
              }}
              placeholder="Enter code"
              value={referral}
              onChangeText={setReferral}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Masters List */}
          {mode === "masters" && (
            <View style={{ paddingHorizontal: 24 }}>
              {masters.map((master) => (
                <TouchableOpacity
                  key={master.id}
                  onPress={() => setSelectedMaster(master)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      selectedMaster?.id === master.id ? "#1f2937" : "#e5e7eb",
                    backgroundColor:
                      selectedMaster?.id === master.id ? "#f9fafb" : "#ffffff",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <Image
                      source={{
                        uri:
                          master.profile_image ||
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        marginRight: 12,
                      }}
                    />

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: 4,
                        }}
                      >
                        {master.name}
                      </Text>
                      {master.title ? (
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#059669",
                            fontWeight: "500",
                            marginBottom: 4,
                          }}
                        >
                          {master.title}
                        </Text>
                      ) : null}
                      {master.rating ? (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Star size={14} color="#fbbf24" fill="#fbbf24" />
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#6b7280",
                              marginLeft: 4,
                            }}
                          >
                            {master.rating} Rating
                          </Text>
                        </View>
                      ) : null}
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <DollarSign size={14} color="#059669" />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#059669",
                          }}
                        >
                          ${master.monthly_price}/month
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor:
                          selectedMaster?.id === master.id
                            ? "#1f2937"
                            : "#d1d5db",
                        backgroundColor:
                          selectedMaster?.id === master.id
                            ? "#1f2937"
                            : "#ffffff",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 4,
                      }}
                    >
                      {selectedMaster?.id === master.id && (
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
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Clubs List */}
          {mode === "clubs" && (
            <View style={{ paddingHorizontal: 24 }}>
              {clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  onPress={() => setSelectedClub(club)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      selectedClub?.id === club.id ? "#1f2937" : "#e5e7eb",
                    backgroundColor:
                      selectedClub?.id === club.id ? "#f9fafb" : "#ffffff",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Image
                      source={{
                        uri:
                          club.cover_image_url ||
                          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop",
                      }}
                      style={{
                        width: 72,
                        height: 56,
                        borderRadius: 8,
                        marginRight: 12,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#111827",
                        }}
                      >
                        {club.name}
                      </Text>
                      {club.master_name ? (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#059669",
                            marginTop: 2,
                          }}
                        >
                          Led by {club.master_name}
                        </Text>
                      ) : null}
                      <Text
                        style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
                        numberOfLines={2}
                      >
                        {club.description || ""}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 6,
                        }}
                      >
                        <DollarSign size={14} color="#059669" />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#059669",
                          }}
                        >
                          {isClubPaid(club) ? formatClubPrice(club) : "Free"}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor:
                          selectedClub?.id === club.id ? "#1f2937" : "#d1d5db",
                        backgroundColor:
                          selectedClub?.id === club.id ? "#1f2937" : "#ffffff",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 4,
                      }}
                    >
                      {selectedClub?.id === club.id && (
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
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <TouchableOpacity
            onPress={handleSubscribe}
            disabled={
              !email.trim() ||
              subscribing ||
              (mode === "masters" ? !selectedMaster : !selectedClub)
            }
            style={{
              backgroundColor:
                email.trim() &&
                !subscribing &&
                (mode === "masters" ? !!selectedMaster : !!selectedClub)
                  ? "#1f2937"
                  : "#d1d5db",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color:
                  email.trim() &&
                  !subscribing &&
                  (mode === "masters" ? !!selectedMaster : !!selectedClub)
                    ? "#ffffff"
                    : "#9ca3af",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              {subscribing
                ? "Working..."
                : mode === "masters"
                  ? selectedMaster
                    ? `Subscribe to ${selectedMaster.name} + Platform`
                    : "Select a master"
                  : selectedClub
                    ? isClubPaid(selectedClub)
                      ? `Join ${selectedClub.name} (payment next)`
                      : `Join ${selectedClub.name}`
                    : "Select a club"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlatformOnly}
            disabled={!email.trim() || subscribing}
            style={{
              backgroundColor:
                !email.trim() || subscribing ? "#d1d5db" : "#111827",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Subscribe to Platform Only
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
