import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, ChevronRight, Globe, Edit3 } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EloStep() {
  const router = useRouter();
  const [mode, setMode] = useState("chesscom"); // 'chesscom' | 'manual'
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [rapid, setRapid] = useState("");
  const [blitz, setBlitz] = useState("");
  const [bullet, setBullet] = useState("");
  const [fetched, setFetched] = useState(null);

  const fetchFromChessCom = async () => {
    if (!username.trim()) {
      Alert.alert("Username required", "Please enter your chess.com username.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/chesscom/${encodeURIComponent(username.trim())}`,
      );
      if (!res.ok) {
        throw new Error("Could not fetch from chess.com");
      }
      const data = await res.json();
      // API returns: { profile, stats: { rapid, blitz, bullet } }
      const stats = data?.stats || {};
      const nextRapid = stats.rapid ?? null;
      const nextBlitz = stats.blitz ?? null;
      const nextBullet = stats.bullet ?? null;
      setRapid(nextRapid ? String(nextRapid) : "");
      setBlitz(nextBlitz ? String(nextBlitz) : "");
      setBullet(nextBullet ? String(nextBullet) : "");
      setFetched({ rapid: nextRapid, blitz: nextBlitz, bullet: nextBullet });
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Not found",
        "Could not find ratings for that username. You can enter them manually.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (mode === "chesscom" && !username.trim()) {
      Alert.alert(
        "Username required",
        "Please enter your chess.com username or switch to manual entry.",
      );
      return;
    }
    const payload = {
      source: mode,
      username: mode === "chesscom" ? username.trim() : null,
      ratings: {
        rapid: rapid ? Number(rapid) : null,
        blitz: blitz ? Number(blitz) : null,
        bullet: bullet ? Number(bullet) : null,
      },
    };
    try {
      await AsyncStorage.setItem("onboarding_elo", JSON.stringify(payload));
      router.push("/onboarding/masters");
    } catch (e) {
      console.error("Error saving ELO:", e);
      Alert.alert("Error", "Could not save your info, please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar style="dark" />

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
            Your current strength
          </Text>
          <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            Step 3 of 4
          </Text>
        </View>
      </View>

      {/* Progress */}
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
            width: "75%",
            height: "100%",
            backgroundColor: "#1f2937",
            borderRadius: 2,
          }}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <Text style={{ fontSize: 16, color: "#6b7280", marginBottom: 12 }}>
          Choose how you'd like to share your current level.
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setMode("chesscom")}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: mode === "chesscom" ? "#1f2937" : "#e5e7eb",
              backgroundColor: mode === "chesscom" ? "#f9fafb" : "#ffffff",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Globe size={18} color="#111827" style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: "600", color: "#111827" }}>
              Use chess.com
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("manual")}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: mode === "manual" ? "#1f2937" : "#e5e7eb",
              backgroundColor: mode === "manual" ? "#f9fafb" : "#ffffff",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Edit3 size={18} color="#111827" style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: "600", color: "#111827" }}>
              Enter manually
            </Text>
          </TouchableOpacity>
        </View>

        {mode === "chesscom" ? (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Chess.com username
            </Text>
            <TextInput
              placeholder="e.g. magnuscarlsen"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
              }}
            />
            <TouchableOpacity
              onPress={fetchFromChessCom}
              style={{
                marginTop: 12,
                backgroundColor: "#111827",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Fetch ratings
                </Text>
              )}
            </TouchableOpacity>

            {rapid || blitz || bullet ? (
              <View
                style={{
                  marginTop: 16,
                  backgroundColor: "F9FAFB",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Text
                  style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}
                >
                  Detected ratings
                </Text>
                <Text style={{ fontSize: 16, color: "#111827" }}>
                  Rapid: {rapid || "—"}
                </Text>
                <Text style={{ fontSize: 16, color: "#111827" }}>
                  Blitz: {blitz || "—"}
                </Text>
                <Text style={{ fontSize: 16, color: "#111827" }}>
                  Bullet: {bullet || "—"}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
              Enter any that apply (optional)
            </Text>
            <View style={{ gap: 10 }}>
              <TextInput
                placeholder="Rapid ELO"
                keyboardType="numeric"
                value={rapid}
                onChangeText={setRapid}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 16,
                }}
              />
              <TextInput
                placeholder="Blitz ELO"
                keyboardType="numeric"
                value={blitz}
                onChangeText={setBlitz}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 16,
                }}
              />
              <TextInput
                placeholder="Bullet ELO"
                keyboardType="numeric"
                value={bullet}
                onChangeText={setBullet}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 16,
                }}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: 24 }}>
        <TouchableOpacity
          onPress={handleContinue}
          style={{
            backgroundColor: "#1f2937",
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "600",
              marginRight: 8,
            }}
          >
            Continue
          </Text>
          <ChevronRight size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
