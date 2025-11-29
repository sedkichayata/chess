import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Users, CheckCircle } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import useUser from "@/utils/auth/useUser";

export default function ClubsList() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberOf, setMemberOf] = useState({});
  const { data: user } = useUser();

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (user?.id && clubs.length > 0) {
      checkMemberships(clubs, user.id);
    }
  }, [user?.id]);

  const fetchClubs = async () => {
    try {
      const res = await fetch("/api/clubs");
      const data = await res.json();
      if (data.clubs) {
        setClubs(data.clubs);
        if (user?.id) {
          checkMemberships(data.clubs, user.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkMemberships = async (clubsList, userId) => {
    try {
      const results = await Promise.all(
        clubsList.map(async (c) => {
          try {
            const r = await fetch(`/api/clubs/${c.id}?userId=${userId}`);
            if (!r.ok) return [c.id, false];
            const j = await r.json();
            const isMember = !!j.membership && j.membership.status === "active";
            return [c.id, isMember];
          } catch (err) {
            return [c.id, false];
          }
        }),
      );
      const map = results.reduce((acc, [id, isMember]) => {
        acc[id] = isMember;
        return acc;
      }, {});
      setMemberOf(map);
    } catch (err) {
      // fail silently; badges just won't show
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
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 32, fontWeight: "800", color: "#000" }}>
          Chess Clubs
        </Text>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#111827" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {clubs.length === 0 ? (
            <Text
              style={{ textAlign: "center", color: "#6B7280", marginTop: 40 }}
            >
              No clubs found. Check back soon!
            </Text>
          ) : (
            clubs.map((club) => (
              <TouchableOpacity
                key={club.id}
                onPress={() => router.push(`/clubs/${club.id}`)}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {/* Image/Header with price chip and MEMBER badge */}
                <View
                  style={{ width: "100%", height: 140, position: "relative" }}
                >
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
                        backgroundColor: "#F3F4F6",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Users size={48} color="#9CA3AF" />
                    </View>
                  )}

                  {/* Price/Free tag */}
                  <View
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "rgba(17,24,39,0.9)",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 16,
                    }}
                  >
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}
                    >
                      {club.monthly_price_cents > 0
                        ? `$${(club.monthly_price_cents / 100).toFixed(2)}/mo`
                        : "Free"}
                    </Text>
                  </View>

                  {/* MEMBER badge (top-left) */}
                  {memberOf[club.id] ? (
                    <View
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        backgroundColor: "rgba(5,150,105,0.95)",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ECFDF5",
                          fontWeight: "800",
                          fontSize: 12,
                        }}
                      >
                        Member
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={{ padding: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: "#111827",
                          marginBottom: 4,
                        }}
                      >
                        {club.name}
                      </Text>
                      {club.master_name && (
                        <Text style={{ fontSize: 13, color: "#6B7280" }}>
                          by {club.master_name}
                        </Text>
                      )}
                    </View>
                    {club.is_verified && (
                      <CheckCircle size={20} color="#059669" />
                    )}
                  </View>

                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 14, color: "#4B5563", marginBottom: 12 }}
                  >
                    {club.description}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTopWidth: 1,
                      borderTopColor: "#F3F4F6",
                      paddingTop: 12,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Users
                        size={16}
                        color="#6B7280"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>
                        Community
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color:
                          club.monthly_price_cents > 0 ? "#111827" : "#059669",
                      }}
                    >
                      {club.monthly_price_cents > 0
                        ? `$${(club.monthly_price_cents / 100).toFixed(2)}/mo`
                        : "Free"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
