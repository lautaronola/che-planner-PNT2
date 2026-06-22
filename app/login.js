import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import authService from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import AuthCard from "../components/Auth/AuthCard";

function LoginScreen() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setAuth(data);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AuthCard
          title={"Bienvenido a\nChe Planner"}
          subtitle="Iniciá sesión para continuar"
          icon={
            <Image
              source={require("../assets/che-planer-logo.png")}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
          }
        >
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Pressable
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Cargando..." : "Ingresar"}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push("/register")}>
            <Text style={styles.link}>
              ¿No tenés cuenta en Che Planner? Registrate
            </Text>
          </Pressable>
        </AuthCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9ff",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#bec9c5",
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#126a5c",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#ffffff", fontWeight: "600", fontSize: 16 },
  link: {
    textAlign: "center",
    marginTop: 24,
    color: "#126a5c",
    fontWeight: "600",
  },
});

export default LoginScreen;
