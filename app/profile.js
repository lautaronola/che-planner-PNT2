import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../hooks/useAuth";

function ProfileScreen() {
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const [fotoUri, setFotoUri] = useState(null);

  const name = auth?.user?.name || "Usuario";
  const email = auth?.user?.email || "";
  const inicial = name.charAt(0).toUpperCase();

  const handleCambiarFoto = () => {
    Alert.alert("Cambiar foto", "¿De dónde querés tomar la foto?", [
      { text: "Cámara", onPress: abrirCamara },
      { text: "Biblioteca", onPress: abrirBiblioteca },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const abrirCamara = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a la cámara para tomar una foto.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const abrirBiblioteca = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tu biblioteca de fotos.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que querés salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => setAuth(null) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Che-Planner</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Avatar */}
        <Pressable style={styles.avatarWrapper} onPress={handleCambiarFoto}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetra}>{inicial}</Text>
            </View>
          )}
          <View style={styles.camaraBadge}>
            <Text style={styles.camaraIcono}>📷</Text>
          </View>
        </Pressable>

        <Text style={styles.cambiarTexto}>Cambiar foto</Text>

        {/* Info del usuario */}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Logout */}
      <View style={styles.footer}>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9ff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 56,
  },
  backButton: { padding: 4 },
  backIcon: { fontSize: 22, color: "#126a5c" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#126a5c",
  },
  headerSpacer: { width: 30 },

  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 48,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "#7ecbba",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#126a5c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  avatarLetra: {
    fontSize: 52,
    fontWeight: "700",
    color: "#00564a",
  },
  camaraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  camaraIcono: { fontSize: 16 },

  cambiarTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: "#126a5c",
    marginBottom: 32,
  },

  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#181c23",
    marginBottom: 6,
  },
  email: {
    fontSize: 15,
    color: "#6f7976",
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  logoutBtn: {
    backgroundColor: "#ffdad6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#93000a",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ProfileScreen;
