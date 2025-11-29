import { Stack } from "expo-router";

export default function ClubsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Chess Clubs", headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Club Details", headerShown: false }}
      />
    </Stack>
  );
}
