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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import authService from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import AuthCard from "../components/Auth/AuthCard";

function RegisterScreen() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await authService.register(name, email, password);
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
          title={"Creá tu cuenta\nChe Planner"}
          subtitle="Completá tus datos para registrarte"
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
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
          />
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
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Cargando..." : "Registrarse"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Ya tengo cuenta</Text>
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

export default RegisterScreen;
