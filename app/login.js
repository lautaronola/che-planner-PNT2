import { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import authService from "../services/authService";
import { useAuth } from "../hooks/useAuth";

function LoginScreen() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>

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
          <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9ff", padding: 20 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#181c23",
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: "#6f7976", marginBottom: 32 },
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
