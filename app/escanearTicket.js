import { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  Pressable,
  Alert,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAuth } from "../hooks/useAuth";
import tripService from "../services/tripService";

// ─── ESTADOS DE LA PANTALLA ───────────────────────────────────────────────────
// "camera"   → visor de cámara activo
// "preview"  → foto tomada, mostrando campos para confirmar
// ─────────────────────────────────────────────────────────────────────────────

function EscanearTicketScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();
  const { auth } = useAuth();

  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState("camera"); // "camera" | "preview"
  const [photoUri, setPhotoUri] = useState(null);
  const [taking, setTaking] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Campos del gasto — los completa el usuario (o Azure en el futuro)
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(
    new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  );

  const cameraRef = useRef(null);

  // Pedir permiso apenas monta la pantalla
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  // ── Tomar foto ──────────────────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    if (!cameraRef.current || taking) return;
    setTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setPhotoUri(photo.uri);
      setStage("preview");
    } catch (e) {
      Alert.alert("Error", "No se pudo tomar la foto. Intentá de nuevo.");
    } finally {
      setTaking(false);
    }
  };

  // ── Reintentar ──────────────────────────────────────────────────────────────
  const handleRetake = () => {
    setPhotoUri(null);
    setMonto("");
    setDescripcion("");
    setStage("camera");
  };

  // ── Confirmar gasto ─────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!monto.trim() || isNaN(Number(monto)) || Number(monto) <= 0) {
      Alert.alert("Error", "Ingresá un monto válido mayor a 0.");
      return;
    }
    setGuardando(true);
    try {
      await tripService.addExpense(
        tripId,
        descripcion.trim() || "Sin descripción",
        Number(monto),
        auth?.user?._id || auth?.user?.id,
        auth?.token,
      );
      Alert.alert("¡Listo!", `Gasto de $${monto} agregado al viaje.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", "No se pudo registrar el gasto. Intentá de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  // ── Sin permiso ─────────────────────────────────────────────────────────────
  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#126a5c" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Permiso de cámara</Text>
        <Text style={styles.permissionText}>
          Necesitamos acceso a tu cámara para escanear tickets.
        </Text>
        <Pressable style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Permitir acceso</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE: CAMERA — visor activo
  // ═══════════════════════════════════════════════════════════════════════════
  if (stage === "camera") {
    return (
      <View style={styles.cameraContainer}>
        {/* Cámara */}
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          {/* Header sobre la cámara */}
          <SafeAreaView style={styles.cameraHeader}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backIcon}>←</Text>
            </Pressable>
            <Text style={styles.cameraTitle}>Escanear Ticket</Text>
            <View style={{ width: 40 }} />
          </SafeAreaView>

          {/* Visor con esquinas */}
          <View style={styles.viewfinderWrapper}>
            <View style={styles.viewfinder}>
              {/* Esquinas */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.viewfinderHint}>
              Enfocá el ticket dentro del marco
            </Text>
          </View>

          {/* Botón disparador */}
          <View style={styles.shutterArea}>
            <Pressable
              style={[styles.shutterBtn, taking && styles.shutterBtnDisabled]}
              onPress={handleTakePhoto}
              disabled={taking}
            >
              {taking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </Pressable>
          </View>
        </CameraView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE: PREVIEW — foto tomada, ingresar datos
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={handleRetake}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Confirmar Gasto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview de la foto */}
        <View style={styles.photoPreviewWrapper}>
          {/* Usamos Image de RN para mostrar la foto tomada */}
          {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
          <View style={styles.photoPlaceholder}>
            {/* 
              Acá va: <Image source={{ uri: photoUri }} style={styles.photo} />
              Lo dejamos como placeholder porque en el emulador sin cámara real
              el uri puede no renderizar. Importá Image de react-native para activarlo.
            */}
            <Text style={styles.photoIcon}>🧾</Text>
            <Text style={styles.photoLabel}>Ticket escaneado</Text>
          </View>

          {/* Badge Azure — lo activa Lautaro */}
          <View style={styles.azureBadge}>
            <Text style={styles.azureBadgeText}>☁️ Procesado con Azure AI</Text>
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Monto */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Monto *</Text>
            <View style={styles.montoRow}>
              <Text style={styles.montoSymbol}>$</Text>
              <TextInput
                style={styles.montoInput}
                placeholder="0.00"
                placeholderTextColor="#bec9c5"
                value={monto}
                onChangeText={setMonto}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Cena en Blue Bay Cafe"
              placeholderTextColor="#bec9c5"
              value={descripcion}
              onChangeText={setDescripcion}
              returnKeyType="done"
            />
          </View>

          {/* Fecha (solo lectura por ahora) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Fecha</Text>
            <View style={styles.inputReadOnly}>
              <Text style={styles.inputReadOnlyText}>📅 {fecha}</Text>
            </View>
          </View>

          {/* Badges de confianza */}
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✅ Confianza Alta</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>☁️ Sincronización Azure AI</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botones fijos abajo */}
      <View style={styles.actions}>
        <Pressable style={styles.retryButton} onPress={handleRetake}>
          <Text style={styles.retryButtonText}>↺  Reintentar</Text>
        </Pressable>
        <Pressable
          style={[styles.confirmButton, guardando && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={guardando}
        >
          <Text style={styles.confirmButtonText}>
            {guardando ? "Guardando..." : "✓  Confirmar"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Genérico ────────────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9ff",
    padding: 32,
  },
  container: { flex: 1, backgroundColor: "#f9f9ff" },

  // ── Permiso ─────────────────────────────────────────────────────────────────
  permissionIcon: { fontSize: 48, marginBottom: 16 },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#181c23",
    marginBottom: 8,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 14,
    color: "#6f7976",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#126a5c",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // ── Cámara ──────────────────────────────────────────────────────────────────
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },

  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  viewfinderWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinder: {
    width: 260,
    height: 340,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#126a5c",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  viewfinderHint: {
    position: "absolute",
    bottom: -32,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "500",
  },

  shutterArea: {
    paddingBottom: 48,
    alignItems: "center",
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnDisabled: { opacity: 0.5 },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
  },

  // ── Header preview ──────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#ebedf9",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 18, color: "#126a5c" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#126a5c" },

  // ── Contenido preview ───────────────────────────────────────────────────────
  content: { paddingHorizontal: 20, paddingBottom: 120 },

  photoPreviewWrapper: { marginTop: 8, marginBottom: 24, position: "relative" },
  photoPlaceholder: {
    height: 200,
    backgroundColor: "#ebedf9",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dfe2ed",
  },
  photoIcon: { fontSize: 48, marginBottom: 8 },
  photoLabel: { fontSize: 14, color: "#6f7976", fontWeight: "600" },

  azureBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(18,106,92,0.9)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  azureBadgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },

  // ── Formulario ──────────────────────────────────────────────────────────────
  form: { gap: 20 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: "700", color: "#3f4946", letterSpacing: 0.5 },

  montoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#126a5c",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  montoSymbol: { fontSize: 24, fontWeight: "700", color: "#126a5c", marginRight: 4 },
  montoInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: "#126a5c",
    paddingVertical: 14,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#bec9c5",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#181c23",
  },

  inputReadOnly: {
    backgroundColor: "#f0f3ff",
    borderWidth: 1,
    borderColor: "#dfe2ed",
    borderRadius: 12,
    padding: 14,
  },
  inputReadOnlyText: { fontSize: 14, color: "#6f7976" },

  // ── Badges ──────────────────────────────────────────────────────────────────
  badges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  badge: {
    backgroundColor: "#ebedf9",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#3f4946" },

  // ── Acciones fijas ──────────────────────────────────────────────────────────
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "#f9f9ff",
    borderTopWidth: 1,
    borderTopColor: "#ebedf9",
  },
  retryButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#bec9c5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  retryButtonText: { fontSize: 16, fontWeight: "600", color: "#6f7976" },
  confirmButton: {
    flex: 1,
    backgroundColor: "#126a5c",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#126a5c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});

export default EscanearTicketScreen;