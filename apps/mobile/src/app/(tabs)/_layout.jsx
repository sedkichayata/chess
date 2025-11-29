import { Tabs } from "expo-router";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Home, Calendar, Trophy, Plus, Crown } from "lucide-react-native";

// Helper to render an icon with an optional small green dot (notification)
function IconWithDot({ Icon, color, showDot }) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon color={color} size={22} />
      {showDot ? (
        <View
          style={{
            position: "absolute",
            top: 2,
            right: 6,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#6CC24A",
          }}
        />
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Chess.com-inspired dark bar with green accent
        tabBarStyle: {
          backgroundColor: "#0F1410", // deep chess.com-like dark
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: 4,
        },
        tabBarActiveTintColor: "#6CC24A", // chess.com green accent
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Reordered tabs: Sessions, Masters, Today (Home), Leaders, Plus */}
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color }) => (
            <IconWithDot Icon={Calendar} color={color} showDot={false} />
          ),
          tabBarAccessibilityLabel: "Sessions tab",
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />

      <Tabs.Screen
        name="masters/index"
        options={{
          title: "Masters",
          tabBarIcon: ({ color }) => (
            <IconWithDot Icon={Crown} color={color} showDot={false} />
          ),
          tabBarAccessibilityLabel: "Masters tab",
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <IconWithDot Icon={Home} color={color} showDot={true} />
          ),
          tabBarAccessibilityLabel: "Today tab",
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />

      {/* Removed Clubs from the bottom tabs by moving it outside the (tabs) folder */}

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaders",
          tabBarIcon: ({ color }) => (
            <IconWithDot Icon={Trophy} color={color} showDot={false} />
          ),
          tabBarAccessibilityLabel: "Leaders tab",
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />

      <Tabs.Screen
        name="plus/index"
        options={{
          title: "Plus",
          tabBarIcon: ({ color }) => (
            <IconWithDot Icon={Plus} color={color} showDot={true} />
          ),
          tabBarAccessibilityLabel: "Plus tab",
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />

      {/* Keep hidden masters detail route */}
      <Tabs.Screen
        name="masters/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
