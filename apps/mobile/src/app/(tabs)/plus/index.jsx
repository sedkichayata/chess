import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";
import {
  User,
  Calendar,
  CreditCard,
  Brain,
  Settings,
  Users,
  Crown,
} from "lucide-react-native";

export default function PlusHome() {
  const insets = useSafeAreaInsets();

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
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#000" }}>
          Plus
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
          All extra features live here.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: "#F9FAFB",
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <Text
            style={{ color: "#111827", fontWeight: "700", marginBottom: 6 }}
          >
            Quick links
          </Text>
          <Text style={{ color: "#6B7280" }}>
            Open the side menu (swipe from the left) or use these shortcuts.
          </Text>
        </View>

        {/* Account */}
        <SectionHeader title="Account" />
        <Link href="/(tabs)/plus/profile" asChild>
          <TouchableOpacity
            style={tileStyle()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Open Profile"
          >
            <User size={22} color="#111827" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={tileTitle()}>Profile</Text>
              <Text style={tileSubtitle()}>
                Account, Chess.com link, AI coach
              </Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/plus/settings" asChild>
          <TouchableOpacity
            style={tileStyle()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Open Settings"
          >
            <Settings size={22} color="#111827" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={tileTitle()}>Settings</Text>
              <Text style={tileSubtitle()}>Preferences and app info</Text>
            </View>
          </TouchableOpacity>
        </Link>

        {/* Training */}
        <SectionHeader title="Training" />
        <Link href="/(tabs)/plus/analysis" asChild>
          <TouchableOpacity
            style={tileStyle()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Open AI Coach"
          >
            <Brain size={22} color="#111827" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={tileTitle()}>AI Coach</Text>
              <Text style={tileSubtitle()}>Weakness analysis & history</Text>
            </View>
          </TouchableOpacity>
        </Link>

        {/* Community */}
        <SectionHeader title="Community" />
        <Link href="/clubs" asChild>
          {/* UPDATED: link to /clubs (outside tabs) */}
          <TouchableOpacity
            style={tileStyle()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Open Chess Clubs"
          >
            <Users size={22} color="#111827" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={tileTitle()}>Chess Clubs</Text>
              <Text style={tileSubtitle()}>
                Join communities & learning tracks
              </Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/masters" asChild>
          <TouchableOpacity
            style={tileStyle()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Open Masters"
          >
            <Crown size={22} color="#111827" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={tileTitle()}>Masters</Text>
              <Text style={tileSubtitle()}>Browse masters & lessons</Text>
            </View>
          </TouchableOpacity>
        </Link>

        {/* Billing */}
        <SectionHeader title="Billing" />
        <Link href="/(tabs)/plus/subscriptions" asChild>
          <TouchableOpacity
            style={tileStyle()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Open Subscriptions"
          >
            <CreditCard size={22} color="#111827" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={tileTitle()}>Subscriptions</Text>
              <Text style={tileSubtitle()}>Manage your plans</Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/plus/bookings" asChild>
          <TouchableOpacity
            style={tileStyle()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Open Bookings"
          >
            <Calendar size={22} color="#111827" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={tileTitle()}>Bookings</Text>
              <Text style={tileSubtitle()}>Your scheduled sessions</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ title }) {
  return (
    <Text
      style={{
        color: "#111827",
        fontWeight: "700",
        fontSize: 13,
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      {title}
    </Text>
  );
}

function tileStyle() {
  return {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  };
}

function tileTitle() {
  return { fontSize: 16, fontWeight: "700", color: "#111827" };
}

function tileSubtitle() {
  return { fontSize: 13, color: "#6B7280", marginTop: 2 };
}
