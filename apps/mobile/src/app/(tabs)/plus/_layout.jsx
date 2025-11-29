import { Stack, useRouter } from "expo-router";
import { usePlusDrawerStore } from "@/utils/usePlusDrawerStore";
import CustomDrawer from "@/components/CustomDrawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Menu,
  X,
  User,
  Calendar,
  CreditCard,
  Brain,
  Settings as SettingsIcon,
  Home,
  Users,
} from "lucide-react-native";

const COLORS = {
  bg: "#0F1410", // dark chess.com-like background
  border: "#1F2A1E",
  text: "#E5E7EB",
  muted: "#9CA3AF",
  accent: "#6CC24A", // green accent
  tile: "#121A14",
};

function DrawerContent() {
  const router = useRouter();
  const { close } = usePlusDrawerStore();
  const insets = useSafeAreaInsets();

  const navigateTo = (path) => {
    close();
    router.push(path);
  };

  const items = [
    { label: "Plus Home", icon: Home, path: "/(tabs)/plus" },
    { label: "Clubs", icon: Users, path: "/clubs" },
    { label: "Profile", icon: User, path: "/(tabs)/plus/profile" },
    { label: "Bookings", icon: Calendar, path: "/(tabs)/plus/bookings" },
    {
      label: "Subscriptions",
      icon: CreditCard,
      path: "/(tabs)/plus/subscriptions",
    },
    { label: "AI Coach", icon: Brain, path: "/(tabs)/plus/analysis" },
    { label: "Settings", icon: SettingsIcon, path: "/(tabs)/plus/settings" },
  ];

  return (
    <View style={[styles.drawerContainer, { paddingTop: insets.top }]}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Plus</Text>
        <TouchableOpacity onPress={close} hitSlop={20}>
          <X size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <View style={styles.drawerItems}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={styles.item}
            onPress={() => navigateTo(item.path)}
          >
            <item.icon size={20} color={COLORS.text} />
            <Text style={styles.itemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function PlusLayout() {
  const { toggle } = usePlusDrawerStore();

  return (
    <CustomDrawer drawerContent={<DrawerContent />}>
      <Stack
        screenOptions={{
          headerLeft: () => (
            <TouchableOpacity onPress={toggle} style={{ marginLeft: 16 }}>
              <Menu size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerTitleStyle: {
            fontWeight: "bold",
            color: COLORS.text,
          },
          headerStyle: {
            backgroundColor: COLORS.bg,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: "Plus Home" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen name="bookings" options={{ title: "Bookings" }} />
        <Stack.Screen
          name="subscriptions"
          options={{ title: "Subscriptions" }}
        />
        <Stack.Screen name="analysis" options={{ title: "AI Coach" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </CustomDrawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: COLORS.bg,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  drawerItems: {
    gap: 2,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "600",
  },
});
