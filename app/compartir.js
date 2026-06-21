import { useState } from "react";
import {
  Text,
  View,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  TextInput,
  Linking,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import tripService from "../services/tripService";

function CompartirScreen() {
  const { auth } = useAuth();
  const router = useRouter();
  const { tripId, tripName } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Miembros mock — después se reemplazan con datos reales del backend
  const miembros = [];

  const handleWhatsApp = () => {
    const mensaje = `¡Hola! Te invito a unirte al viaje "${tripName || "Che Planner"}" 🧳`;
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    Linking.openURL(url);
  };

  // ── Mapea el mensaje crudo del backend a texto amigable ──────────────────
  const getMensajeError = (rawMessage = "") => {
    if (!tripId) {
      return "No se encontró el viaje. Volvé atrás e intentá de nuevo.";
    }
    if (!auth?.token) {
      return "Tu sesión expiró. Volvé a iniciar sesión.";
    }
    if (rawMessage.includes("User not found")) {
      return "Ese email no está registrado en Che Planner. La persona primero debe crear una cuenta.";
    }
    if (rawMessage.includes("already on this trip")) {
      return "Esa persona ya está en el viaje.";
    }
    if (rawMessage.includes("Closed trip")) {
      return "Este viaje ya está cerrado, no se pueden agregar más personas.";
    }
    if (rawMessage.includes("Unauthorized")) {
      return "Tu sesión expiró. Volvé a iniciar sesión.";
    }
    if (rawMessage.includes("Network request failed") || rawMessage.includes("fetch")) {
      return "No se pudo conectar. Chequeá tu conexión.";
    }
    return "No se pudo agregar el integrante. Intentá de nuevo.";
  };

  const handleAddMember = async () => {
    // Validaciones previas al fetch
    if (!email.trim()) {
      Alert.alert("Error", "Ingresá un email");
      return;
    }
    if (!tripId) {
      Alert.alert("Error", "No se encontró el viaje. Volvé atrás e intentá de nuevo.");
      return;
    }
    if (!auth?.token) {
      Alert.alert("Error", "Tu sesión expiró. Volvé a iniciar sesión.");
      return;
    }

    setLoading(true);
    try {
      await tripService.addMember(tripId, email.trim(), auth?.token);
      Alert.alert("¡Listo!", `${email} fue agregado al viaje`);
      setEmail("");
      setShowEmailInput(false);
    } catch (error) {
      Alert.alert("Error", getMensajeError(error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Compartir Viaje</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Botón WhatsApp */}
        <Pressable style={styles.whatsappButton} onPress={handleWhatsApp}>
          <View style={styles.whatsappLeft}>
            <Text style={styles.whatsappIcon}>💬</Text>
            <Text style={styles.whatsappText}>Compartir por WhatsApp</Text>
          </View>
          <Text style={styles.whatsappChevron}>›</Text>
        </Pressable>

        {/* Viajeros Actuales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Viajeros Actuales</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{miembros.length + 1} Miembros</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {miembros.map((m) => (
              <View key={m.id} style={styles.card}>
                <View style={[styles.cardAvatar, { backgroundColor: m.color }]}>
                  <Text style={styles.cardAvatarText}>{m.nombre[0]}</Text>
                </View>
                <Text style={styles.cardName}>{m.nombre}</Text>
                <Text style={styles.cardRol}>{m.rol}</Text>
              </View>
            ))}

            {/* Botón Invitar Más */}
            <Pressable
              style={styles.inviteCard}
              onPress={() => setShowEmailInput(!showEmailInput)}
            >
              <View style={styles.inviteIcon}>
                <Text style={styles.inviteIconText}>+</Text>
              </View>
              <Text style={styles.inviteText}>Invitar Más</Text>
            </Pressable>
          </View>
        </View>

        {/* Input email — aparece al tocar "Invitar Más" */}
        {showEmailInput && (
          <View style={styles.emailSection}>
            <TextInput
              style={styles.input}
              placeholder="Email del integrante"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <Pressable
              style={[styles.addButton, loading && styles.addButtonDisabled]}
              onPress={handleAddMember}
              disabled={loading}
            >
              <Text style={styles.addButtonText}>
                {loading ? "Agregando..." : "Agregar integrante"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Copiar link */}
        <View style={styles.linkSection}>
          <View style={styles.linkLeft}>
            <Text style={styles.linkIcon}>🔗</Text>
            <Text style={styles.linkText} numberOfLines={1}>
              cheplanner.com/trip/invite
            </Text>
          </View>
          <Pressable onPress={handleCopyLink}>
            <Text style={styles.copyButton}>
              {copied ? "¡Copiado!" : "Copiar"}
            </Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Inicio</Text>
        </Pressable>
        <Pressable style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>🧭</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Viajes</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>🧾</Text>
          <Text style={styles.navLabel}>Gastos</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Perfil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9ff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f9f9ff",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "#ebedf9",
  },
  backIcon: { fontSize: 18, color: "#126a5c" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#126a5c" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#7ecbba",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Content
  content: { paddingHorizontal: 20, paddingBottom: 100 },

  // WhatsApp
  whatsappButton: {
    backgroundColor: "#25D366",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
  whatsappLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  whatsappIcon: { fontSize: 22 },
  whatsappText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  whatsappChevron: { color: "#fff", fontSize: 22 },

  // Sección viajeros
  section: { marginTop: 32 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#181c23" },
  badge: {
    backgroundColor: "#a4c5ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#2e5183" },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dfe2ed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  cardAvatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardAvatarText: { fontSize: 24, fontWeight: "700", color: "#fff" },
  cardName: { fontSize: 15, fontWeight: "600", color: "#181c23" },
  cardRol: { fontSize: 12, fontWeight: "600", color: "#6f7976", marginTop: 2 },

  // Invitar más
  inviteCard: {
    width: "47%",
    backgroundColor: "#FFEDD5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  inviteIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  inviteIconText: { fontSize: 28, color: "#7c5548" },
  inviteText: { fontSize: 15, fontWeight: "600", color: "#7c5548" },

  // Email input
  emailSection: { marginTop: 16 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#bec9c5",
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#126a5c",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  // Link
  linkSection: {
    marginTop: 32,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ebedf9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  linkLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  linkIcon: { fontSize: 18 },
  linkText: { fontSize: 14, color: "#6f7976", flex: 1 },
  copyButton: { fontSize: 15, fontWeight: "600", color: "#126a5c", marginLeft: 16 },

  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
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

export default CompartirScreen;