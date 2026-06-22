import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../hooks/useAuth";

function RootNavigation() {
  const { auth } = useAuth();
  const isLoggedIn = auth !== null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="detalle-viaje" />
        <Stack.Screen name="nuevo-viaje" />
        <Stack.Screen name="deudas" />
        <Stack.Screen name="compartir" />
        <Stack.Screen name="escanearTicket" />
        <Stack.Screen name="profile" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}

function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

export default RootLayout;
