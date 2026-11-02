import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="details"
        options={{
          title: "Pokémon Details",
          headerStyle: { backgroundColor: '#ef5350' },
          headerTitleStyle: { color: '#fff' },
          headerTintColor: '#fff',
        }}
      />
    </Stack>
  );
}