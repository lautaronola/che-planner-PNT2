import { useState, useEffect } from "react";
import {
  Text, View, Pressable, Alert, StyleSheet,
  ScrollView, Modal, TextInput, ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import tripService from "../services/tripService";

const inicial = (nombre) => (nombre || "?").charAt(0).toUpperCase();
const esObjectId = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);

const resolverNombre = (valor, members = []) => {
  if (!valor) return "Alguien";
  if (typeof valor === "object") return valor.name || valor.email || "Alguien";
  const encontrado = members.find(
    (m) => m._id === valor || m.id === valor || m.email === valor
  );
  if (encontrado) return encontrado.name || encontrado.email || "Integrante";
  return esObjectId(valor) ? "Integrante" : valor;
};

const normalizarDeudas = (debts, members = []) => {
  const lista = Array.isArray(debts)
    ? debts
    : debts?.transactions || debts?.debts || debts?.detail || [];
  return lista.map((d, i) => ({
    id: (d.id || d._id || i).toString(),
    deudor: resolverNombre(d.from ?? d.deudor ?? d.debtor ?? d.debtorId, members),
    acreedor: resolverNombre(d.to ?? d.acreedor ?? d.creditor ?? d.creditorId, members),
    concepto: d.concepto || d.concept || "Gastos del viaje",
    monto: d.amount ?? d.monto ?? 0,
  }));
};

function DetalleViajeScreen() {
  const { auth } = useAuth();
  const router = useRouter();
  const { tripId, tripName } = useLocalSearchParams();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cerrando, setCerrando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagoMonto, setPagoMonto] = useState("");
  const [pagoDestinatario, setPagoDestinatario] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [cerrarModalVisible, setCerrarModalVisible] = useState(false);
  const [cerrarError, setCerrarError] = useState("");

  const cargar = async () => {
    if (!tripId) { setError("No se encontro el viaje."); setLoading(false); return; }
    try {
      setLoading(true);
      const data = await tripService.getTripSummary(tripId, auth?.token);
      setSummary(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [tripId]);

  const handleCerrarViaje = () => {
    setCerrarError("");
    setCerrarModalVisible(true);
  };

  const confirmarCierre = async () => {
    setCerrando(true);
    setCerrarError("");
    try {
      await tripService.closeTrip(tripId, auth?.token);
      setCerrarModalVisible(false);
      router.replace("/");
    } catch (e) {
      setCerrarError(
        e.message?.includes("Closed trip")
          ? "Este viaje ya esta cerrado."
          : "No se pudo cerrar el viaje. Intenta de nuevo."
      );
    } finally {
      setCerrando(false);
    }
  };

  const handleRegistrarPago = async () => {
    if (!pagoMonto.trim() || isNaN(Number(pagoMonto)) || Number(pagoMonto) <= 0) {
      Alert.alert("Error", "Ingresa un monto valido mayor a 0.");
      return;
    }
    if (!pagoDestinatario.trim()) {
      Alert.alert("Error", "Ingresa el email de a quien le pagas.");
      return;
    }
    setRegistrando(true);
    try {
      await tripService.addPayment(tripId, pagoDestinatario.trim(), Number(pagoMonto), auth?.token);
      Alert.alert("Listo!", `Pago de $${pagoMonto} registrado correctamente.`);
      setPagoMonto(""); setPagoDestinatario("");
      setModalVisible(false);
      cargar();
    } catch (e) {
      Alert.alert("Error", "No se pudo registrar el pago. Intenta de nuevo.");
    } finally {
      setRegistrando(false);
    }
  };

  const inicialUsuario = (auth?.user?.name || "U").charAt(0).toUpperCase();
  const viajeActivo = summary?.trip?.status !== false;
  const nombreViaje = tripName || summary?.trip?.name || "Detalle del Viaje";
  const destino = summary?.trip?.destination || "";
  const members = summary?.trip?.members || [];
  const deudas = normalizarDeudas(summary?.debts, members);
  const totalASaldar = summary?.totalDebtPending ?? summary?.totalDebt ?? 0;

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backIcon}>←</Text>
          </Pressable>
          <Text style={s.headerTitle}>Detalle del Viaje</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable><Text style={s.editarBtn}>Editar</Text></Pressable>
          <View style={s.avatar}><Text style={s.avatarText}>{inicialUsuario}</Text></View>
        </View>
      </View>

      {loading ? (
        <View style={s.centro}><ActivityIndicator size="large" color="#126a5c" /></View>
      ) : error ? (
        <View style={s.centro}><Text style={s.errorText}>{error}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Encabezado del viaje */}
          <View style={s.viajeHeader}>
            <View style={s.viajeHeaderTop}>
              <Text style={s.viajeNombre} numberOfLines={1}>{nombreViaje}</Text>
              <View style={[s.statusBadge, !viajeActivo && s.statusCerrado]}>
                <Text style={s.statusText}>{viajeActivo ? "En curso" : "Cerrado"}</Text>
              </View>
            </View>
            {destino ? <Text style={s.viajeDestino}>📍 {destino}</Text> : null}
          </View>

          {/* Balance de Gastos */}
          <View style={s.seccionHeader}>
            <Text style={s.seccionTitle}>Balance de Gastos</Text>
          </View>

          <View style={s.totalCard}>
            <Text style={s.totalLabel}>Total a saldar</Text>
            <Text style={s.totalMonto}>${Number(totalASaldar).toLocaleString("es-AR")}</Text>
            <Text style={s.totalSub}>
              {deudas.length} {deudas.length === 1 ? "deuda pendiente" : "deudas pendientes"} · {members.length} {members.length === 1 ? "integrante" : "integrantes"}
            </Text>
          </View>

          {!deudas.length ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>Todos estan a mano por ahora.</Text>
            </View>
          ) : (
            deudas.map((d) => (
              <View key={d.id} style={s.balanceCard}>
                <View style={s.balanceLeft}>
                  <View style={s.avatarStack}>
                    <View style={[s.miniAvatar, { backgroundColor: "#f4b8b0" }]}>
                      <Text style={s.miniAvatarText}>{inicial(d.deudor)}</Text>
                    </View>
                    <View style={[s.miniAvatar, s.miniAvatarOver, { backgroundColor: "#7ecbba" }]}>
                      <Text style={s.miniAvatarText}>{inicial(d.acreedor)}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.balanceDesc} numberOfLines={1}>
                      {d.deudor} le debe a {d.acreedor}
                    </Text>
                    <Text style={s.balanceSub}>{d.concepto}</Text>
                  </View>
                </View>
                <Text style={s.balanceMonto}>${Number(d.monto).toLocaleString("es-AR")}</Text>
              </View>
            ))
          )}

          {/* Gastos Recientes */}
          <View style={[s.seccionHeader, { marginTop: 24 }]}>
            <Text style={s.seccionTitle}>Gastos Recientes</Text>
            <Pressable onPress={() => router.push(`/deudas?tripId=${tripId}`)}>
              <Text style={s.verTodos}>Ver todos</Text>
            </Pressable>
          </View>

          {!summary?.expenses?.length ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>No hay gastos cargados todavia.</Text>
            </View>
          ) : (
            summary.expenses.slice(0, 4).map((e, i) => (
              <View key={e._id || i} style={s.gastoCard}>
                <View style={s.gastoIconContainer}>
                  <Text style={s.gastoIconText}>🧾</Text>
                </View>
                <View style={s.gastoInfo}>
                  <Text style={s.gastoDesc} numberOfLines={1}>{e.description || "Sin descripcion"}</Text>
                  <Text style={s.gastoSub}>
                    {e.date ? new Date(e.date).toLocaleDateString("es-AR") : ""}
                  </Text>
                </View>
                <View style={s.gastoRight}>
                  <Text style={s.gastoMonto}>${Number(e.totalAmount || 0).toLocaleString("es-AR")}</Text>
                </View>
              </View>
            ))
          )}

          {/* Finalizar Viaje */}
          {viajeActivo && (
            <View style={s.finalizarSection}>
              <Pressable
                style={[s.finalizarBtn, cerrando && s.disabled]}
                onPress={handleCerrarViaje}
                disabled={cerrando}
              >
                <Text style={s.finalizarIcon}>🏁</Text>
                <Text style={s.finalizarText}>{cerrando ? "Cerrando..." : "Finalizar Viaje"}</Text>
              </Pressable>
              <Text style={s.finalizarSub}>
                Finalizar el viaje bloqueara la edicion y generara el resumen final de pagos.
              </Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* FAB + */}
      {!loading && !error && viajeActivo && (
        <Pressable style={s.fab} onPress={() => setModalVisible(true)}>
          <Text style={s.fabText}>+</Text>
        </Pressable>
      )}

      {/* Modal Registrar Pago */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Registrar Pago</Text>
            <Text style={s.modalLabel}>Email de a quien le pagas</Text>
            <TextInput
              style={s.input}
              placeholder="email@ejemplo.com"
              value={pagoDestinatario}
              onChangeText={setPagoDestinatario}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={s.modalLabel}>Monto ($)</Text>
            <TextInput
              style={s.input}
              placeholder="0"
              value={pagoMonto}
              onChangeText={setPagoMonto}
              keyboardType="numeric"
            />
            <View style={s.modalBtns}>
              <Pressable style={s.cancelBtn} onPress={() => { setModalVisible(false); setPagoMonto(""); setPagoDestinatario(""); }}>
                <Text style={s.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[s.confirmBtn, registrando && s.disabled]} onPress={handleRegistrarPago} disabled={registrando}>
                <Text style={s.confirmText}>{registrando ? "Registrando..." : "Confirmar"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={cerrarModalVisible} transparent animationType="fade" onRequestClose={() => setCerrarModalVisible(false)}>
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Finalizar Viaje</Text>
            <Text style={s.modalMensaje}>
              Finalizar el viaje bloqueara la edicion y generara el resumen final de pagos.
            </Text>
            {cerrarError ? <Text style={s.modalError}>{cerrarError}</Text> : null}
            <View style={s.modalBtns}>
              <Pressable style={s.cancelBtn} onPress={() => setCerrarModalVisible(false)} disabled={cerrando}>
                <Text style={s.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[s.dangerBtn, cerrando && s.disabled]} onPress={confirmarCierre} disabled={cerrando}>
                <Text style={s.dangerText}>{cerrando ? "Cerrando..." : "Finalizar"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={s.nav}>
        <Pressable style={s.navItem} onPress={() => router.replace("/")}>
          <Text style={s.navIcon}>🏠</Text>
          <Text style={s.navLabel}>Inicio</Text>
        </Pressable>
        <Pressable style={[s.navItem, s.navActive]}>
          <Text style={s.navIcon}>🧭</Text>
          <Text style={[s.navLabel, s.navLabelActive]}>Viaje</Text>
        </Pressable>
        <Pressable style={s.navItem} onPress={() => router.push(`/deudas?tripId=${tripId}`)}>
          <Text style={s.navIcon}>🧾</Text>
          <Text style={s.navLabel}>Gastos</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9ff" },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 56 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn: { padding: 8, borderRadius: 999, backgroundColor: "#ebedf9" },
  backIcon: { fontSize: 18, color: "#126a5c" },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#181c23" },
  editarBtn: { fontSize: 14, fontWeight: "600", color: "#126a5c", paddingHorizontal: 12, paddingVertical: 6 },
  avatar: { width: 40, height: 40, borderRadius: 999, backgroundColor: "#7ecbba", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  avatarText: { color: "#00564a", fontWeight: "700", fontSize: 16 },

  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  errorText: { color: "#ba1a1a", fontSize: 14, textAlign: "center" },

  content: { paddingHorizontal: 20, paddingTop: 12 },

  // Encabezado viaje
  viajeHeader: { marginBottom: 20 },
  viajeHeaderTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  viajeNombre: { flex: 1, fontSize: 24, fontWeight: "700", color: "#181c23" },
  viajeDestino: { fontSize: 13, fontWeight: "600", color: "#6f7976", marginTop: 4 },

  // Secciones
  seccionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  seccionTitle: { fontSize: 20, fontWeight: "600", color: "#181c23" },
  statusBadge: { backgroundColor: "#ebedf9", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  statusCerrado: { backgroundColor: "#ffdad6" },
  statusText: { fontSize: 12, fontWeight: "600", color: "#3f4946" },
  verTodos: { fontSize: 14, fontWeight: "600", color: "#126a5c" },

  totalCard: { backgroundColor: "#126a5c", borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#126a5c", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 4 },
  totalLabel: { color: "#cfeae3", fontSize: 13, fontWeight: "600" },
  totalMonto: { color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 2 },
  totalSub: { color: "#cfeae3", fontSize: 12, marginTop: 4 },

  // Balance cards
  balanceCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#ebedf9", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2 },
  balanceLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatarStack: { flexDirection: "row" },
  miniAvatar: { width: 32, height: 32, borderRadius: 999, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  miniAvatarOver: { marginLeft: -8 },
  miniAvatarText: { fontSize: 12, fontWeight: "700", color: "#00564a" },
  balanceDesc: { fontSize: 14, color: "#181c23", fontWeight: "500" },
  balanceSub: { fontSize: 12, color: "#6f7976", marginTop: 2 },
  balanceMonto: { fontSize: 18, fontWeight: "700", color: "#126a5c" },

  // Gastos
  gastoCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2 },
  gastoIconContainer: { width: 48, height: 48, borderRadius: 999, backgroundColor: "#d4f0e8", alignItems: "center", justifyContent: "center", marginRight: 16 },
  gastoIconText: { fontSize: 20 },
  gastoInfo: { flex: 1 },
  gastoDesc: { fontSize: 14, fontWeight: "600", color: "#181c23" },
  gastoSub: { fontSize: 12, color: "#6f7976", marginTop: 2 },
  gastoRight: { alignItems: "flex-end" },
  gastoMonto: { fontSize: 16, fontWeight: "600", color: "#181c23" },

  emptyCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, alignItems: "center", marginBottom: 16 },
  emptyText: { color: "#6f7976", fontSize: 14 },

  // Finalizar
  finalizarSection: { paddingTop: 16, paddingBottom: 8 },
  finalizarBtn: { backgroundColor: "#ffdad6", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2 },
  finalizarIcon: { fontSize: 20 },
  finalizarText: { fontSize: 16, fontWeight: "600", color: "#93000a" },
  finalizarSub: { fontSize: 12, color: "#6f7976", textAlign: "center", marginTop: 12, paddingHorizontal: 16, fontStyle: "italic" },
  disabled: { opacity: 0.6 },

  // FAB
  fab: { position: "absolute", bottom: 90, right: 24, width: 56, height: 56, borderRadius: 999, backgroundColor: "#126a5c", alignItems: "center", justifyContent: "center", shadowColor: "#126a5c", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  fabText: { color: "#fff", fontSize: 32, fontWeight: "300", lineHeight: 38 },

  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "85%", elevation: 8 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#181c23", marginBottom: 16 },
  modalLabel: { fontSize: 13, fontWeight: "600", color: "#3f4946", marginBottom: 6 },
  input: { backgroundColor: "#f9f9ff", borderWidth: 1, borderColor: "#dfe2ed", borderRadius: 8, padding: 14, fontSize: 14, marginBottom: 16 },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#dfe2ed", alignItems: "center" },
  cancelText: { color: "#6f7976", fontWeight: "600" },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: "#126a5c", alignItems: "center" },
  confirmText: { color: "#fff", fontWeight: "600" },
  modalMensaje: { fontSize: 14, color: "#3f4946", lineHeight: 20, marginBottom: 20 },
  modalError: { fontSize: 13, color: "#ba1a1a", marginBottom: 12 },
  dangerBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: "#93000a", alignItems: "center" },
  dangerText: { color: "#fff", fontWeight: "600" },

  // Nav
  nav: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#fff", paddingVertical: 12, paddingBottom: 20, borderTopLeftRadius: 12, borderTopRightRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 10 },
  navItem: { alignItems: "center", paddingHorizontal: 20, paddingVertical: 4 },
  navActive: { backgroundColor: "#a4c5ff", borderRadius: 999, paddingHorizontal: 20, paddingVertical: 4 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 12, fontWeight: "600", color: "#6f7976", marginTop: 2 },
  navLabelActive: { color: "#2e5183" },
});

export default DetalleViajeScreen;