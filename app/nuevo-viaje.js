import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import tripService from "../services/tripService";
import userService from "../services/userService";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDQJlFeRbsMM3Q4MVTjozqPIDlrpAndBp1cVjZTihauD4qPOMaWjQ5sxmUwdPCewPiCFc5LbKGSfwNGW3U7edtlVdjPMOhCts1hSRlM36PoCXrow0gLdJc6vFDzPbPlLVU0LjMzUiAIaZNsE6Z8oYCgBiYpvLNk_0YZKfl8JFJnLwuOwUuZP2kSZiaXt_zDGhw0CbbVLIO3xrRGI3k9jMmkDyT7-G075N7PLbN7Exs7-7IKUuEPun9TYkBafR1DvmZO38F6AYxM4bZi";

function NuevoViajeScreen() {
  const { auth } = useAuth();
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [destino, setDestino] = useState("");
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const irA = (ruta) => router.replace(ruta);

  const onBuscar = async (texto) => {
    setQuery(texto);
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }
    try {
      const data = await userService.searchUsers(texto.trim(), auth?.token);
      setResultados(data);
    } catch (error) {
      setResultados([]);
    }
  };

  const estaSeleccionado = (id) => seleccionados.some((u) => u.id === id);

  const toggleSeleccion = (user) => {
    const id = user._id;
    if (estaSeleccionado(id)) {
      setSeleccionados((prev) => prev.filter((u) => u.id !== id));
    } else {
      setSeleccionados((prev) => [
        ...prev,
        { id, name: user.name, email: user.email },
      ]);
    }
  };

  const handleCrearViaje = async () => {
    if (!nombre.trim()) {
      setMensaje("Ingresá el nombre del viaje");
      return;
    }
    setMensaje("");
    setLoading(true);
    try {
      const data = await tripService.createViaje(
        nombre.trim(),
        destino.trim(),
        auth?.token
      );
      const tripId = data.insertedId;
      for (const u of seleccionados) {
        try {
          await tripService.addMember(tripId, u.email, auth?.token);
        } catch (error) {
          console.error("No se pudo invitar a", u.email, error);
        }
      }
      irA("/");
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => irA("/")}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Che-Planner</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Planifica tu Próxima Aventura</Text>
          <Text style={styles.heroSubtitle}>
            Organiza gastos e invita amigos sin esfuerzo.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre del Viaje</Text>
          <TextInput
            style={styles.input}
            placeholder="Verano en la Costa"
            placeholderTextColor="#bec9c5"
            value={nombre}
            onChangeText={setNombre}
            maxLength={20}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Destino</Text>
          <View style={styles.inputIconWrapper}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={[styles.input, styles.inputWithIcon]}
              placeholder="Italia"
              placeholderTextColor="#bec9c5"
              value={destino}
              onChangeText={setDestino}
            />
          </View>
        </View>

        <View style={styles.imageCard}>
          <Image source={{ uri: HERO_IMAGE }} style={styles.image} resizeMode="cover" />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageText}>Prepárate para tu viaje</Text>
          </View>
        </View>

        <View style={styles.inviteCard}>
          <View style={styles.inviteHeader}>
            <Text style={styles.inviteTitle}>Invitar Amigos</Text>
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar contactos..."
                placeholderTextColor="#bec9c5"
                value={query}
                onChangeText={onBuscar}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.lista}>
            {query.trim().length < 2 ? (
              <Text style={styles.vacioText}>Escribí para buscar usuarios.</Text>
            ) : resultados.length === 0 ? (
              <Text style={styles.vacioText}>Sin resultados.</Text>
            ) : (
              resultados.map((u) => {
                const activo = estaSeleccionado(u._id);
                return (
                  <Pressable
                    key={u._id}
                    style={styles.contactRow}
                    onPress={() => toggleSeleccion(u)}
                  >
                    <View style={styles.contactLeft}>
                      <View style={styles.contactAvatar}>
                        <Text style={styles.contactAvatarText}>
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{u.name}</Text>
                        <Text style={styles.contactEmail}>{u.email}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.toggle,
                        activo ? styles.toggleActivo : styles.toggleInactivo,
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          activo ? styles.toggleTextActivo : styles.toggleTextInactivo,
                        ]}
                      >
                        {activo ? "✓" : "+"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>

          <View style={styles.selectedFooter}>
            <Text style={styles.selectedLabel}>
              Invitados ({seleccionados.length})
            </Text>
            {seleccionados.map((u) => (
              <View key={u.id} style={styles.selectedRow}>
                <Text style={styles.selectedEmail}>{u.email}</Text>
                <Pressable onPress={() => toggleSeleccion({ _id: u.id })} hitSlop={8}>
                  <Text style={styles.quitarText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}

        <Pressable
          style={styles.crearButton}
          onPress={handleCrearViaje}
          disabled={loading}
        >
          <Text style={styles.crearButtonText}>
            {loading ? "Creando..." : "Crear Viaje"}
          </Text>
          <Text style={styles.crearButtonIcon}>✈️</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => irA("/")}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Inicio</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => irA("/")}>
          <Text style={styles.navIcon}>🧾</Text>
          <Text style={styles.navLabel}>Gastos</Text>
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
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600", color: "#126a5c" },
  headerSpacer: { width: 30 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#7ecbba",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarText: { color: "#00564a", fontWeight: "700", fontSize: 14 },

  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },

  hero: { marginBottom: 24 },
  heroTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#181c23",
    lineHeight: 40,
    marginBottom: 4,
  },
  heroSubtitle: { fontSize: 16, color: "#3f4946", lineHeight: 24 },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3f4946",
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F7F8FA",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#181c23",
  },
  inputIconWrapper: { justifyContent: "center" },
  inputIcon: { position: "absolute", left: 14, zIndex: 1, fontSize: 16 },
  inputWithIcon: { paddingLeft: 40 },

  imageCard: {
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#7ecbba",
  },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(18,106,92,0.45)",
  },
  imageText: { color: "#ffffff", fontSize: 18, fontWeight: "600" },

  inviteCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  inviteHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dfe2ed",
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#126a5c",
    marginBottom: 8,
  },
  searchWrapper: { justifyContent: "center" },
  searchIcon: { position: "absolute", left: 14, zIndex: 1, fontSize: 14 },
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingVertical: 8,
    paddingLeft: 38,
    paddingRight: 16,
    fontSize: 14,
    color: "#181c23",
    borderWidth: 1,
    borderColor: "#dfe2ed",
  },

  lista: { padding: 16 },
  vacioText: { fontSize: 13, color: "#6f7976" },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  contactLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#7ecbba",
    alignItems: "center",
    justifyContent: "center",
  },
  contactAvatarText: { fontWeight: "700", fontSize: 14, color: "#00564a" },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: "600", color: "#181c23" },
  contactEmail: { fontSize: 12, color: "#3f4946" },
  toggle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleInactivo: { borderWidth: 2, borderColor: "rgba(18,106,92,0.2)" },
  toggleActivo: { backgroundColor: "#126a5c" },
  toggleText: { fontSize: 16, fontWeight: "700" },
  toggleTextInactivo: { color: "#126a5c" },
  toggleTextActivo: { color: "#ffffff" },

  selectedFooter: { padding: 16, backgroundColor: "#f0f3ff" },
  selectedLabel: { fontSize: 12, color: "#6f7976", marginBottom: 8 },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  selectedEmail: { fontSize: 14, color: "#181c23", flex: 1 },
  quitarText: { fontSize: 16, color: "#6f7976" },

  mensaje: { color: "#ba1a1a", fontSize: 14, marginTop: 16, textAlign: "center" },

  crearButton: {
    backgroundColor: "#126a5c",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    shadowColor: "#126a5c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 4,
  },
  crearButtonText: { color: "#ffffff", fontSize: 18, fontWeight: "600" },
  crearButtonIcon: { fontSize: 18 },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 4 },
  navItemActive: {
    backgroundColor: "#a4c5ff",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 12, fontWeight: "600", color: "#6f7976", marginTop: 2 },
  navLabelActive: { color: "#2e5183" },
});

export default NuevoViajeScreen;
