import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import tripService from "../services/tripService";

const inicial = (nombre) => (nombre || "?").charAt(0).toUpperCase();
const formatearMonto = (monto) => `$${Number(monto || 0).toLocaleString("es-AR")}`;

// Resuelve el nombre de un integrante a partir de lo que devuelva la API.
// Si es un objeto usa .name; si es un id, lo busca en members del viaje.
const esObjectId = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);

const resolverNombre = (valor, members = []) => {
  if (!valor) return "Alguien";
  if (typeof valor === "object") return valor.name || valor.email || "Alguien";
  const encontrado = members.find(
    (m) => m._id === valor || m.id === valor || m.email === valor
  );
  if (encontrado) return encontrado.name || encontrado.email || "Integrante";
  // Si es un id que no pudimos cruzar con members, evitamos mostrarlo crudo.
  return esObjectId(valor) ? "Integrante" : valor;
};

// Adapta la respuesta de calculateDebts a las filas que pinta la lista.
// "debts" puede venir como array directo o dentro de una propiedad.
const normalizarDeudas = (debts, members = []) => {
  const lista = Array.isArray(debts)
    ? debts
    : debts?.transactions || debts?.debts || debts?.detail || [];

  return lista.map((d, i) => ({
    id: (d.id || d._id || i).toString(),
    deudor: resolverNombre(d.from ?? d.deudor ?? d.debtor, members),
    acreedor: resolverNombre(d.to ?? d.acreedor ?? d.creditor, members),
    concepto: d.concepto || d.concept || "Gastos del viaje",
    monto: d.amount ?? d.monto ?? 0,
  }));
};

function DeudasScreen() {
  const { auth } = useAuth();
  const router = useRouter();
  const { tripId } = useLocalSearchParams();
  const irA = (ruta) => router.replace(ruta);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deudas, setDeudas] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      if (!tripId) {
        setError("No se indicó el viaje.");
        setLoading(false);
        return;
      }
      try {
        const summary = await tripService.getTripSummary(tripId, auth?.token);
        if (!activo) return;
        const members = summary?.trip?.members || [];
        setDeudas(normalizarDeudas(summary?.debts, members));
        setTotal(summary?.totalDebtPending ?? summary?.totalDebt ?? 0);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setLoading(false);
      }
    };
    cargar();
    return () => {
      activo = false;
    };
  }, [tripId]);

  const inicialUsuario = (auth?.user?.name || "U").charAt(0).toUpperCase();

  const renderDeuda = ({ item }) => (
    <View style={styles.deudaCard}>
      <View style={styles.deudaLeft}>
        <View style={styles.avatares}>
          <View style={[styles.miniAvatar, styles.avatarDeudor]}>
            <Text style={styles.miniAvatarText}>{inicial(item.deudor)}</Text>
          </View>
          <View style={[styles.miniAvatar, styles.avatarAcreedor]}>
            <Text style={styles.miniAvatarText}>{inicial(item.acreedor)}</Text>
          </View>
        </View>
        <View style={styles.deudaInfo}>
          <Text style={styles.nombres} numberOfLines={1}>
            <Text style={styles.bold}>{item.deudor}</Text> le debe a{" "}
            <Text style={styles.bold}>{item.acreedor}</Text>
          </Text>
          <Text style={styles.detalle} numberOfLines={1}>
            {item.concepto}
          </Text>
        </View>
      </View>
      <Text style={styles.monto}>{formatearMonto(item.monto)}</Text>
    </View>
  );

  const Header = (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Deudas del Viaje</Text>
        <Text style={styles.heroSubtitle}>
          Quién le debe a quién, todo en un solo lugar.
        </Text>
      </View>

      <View style={styles.resumenCard}>
        <Text style={styles.resumenLabel}>Total a saldar</Text>
        <Text style={styles.resumenMonto}>{formatearMonto(total)}</Text>
        <Text style={styles.resumenSub}>
          {deudas.length}{" "}
          {deudas.length === 1 ? "deuda pendiente" : "deudas pendientes"}
        </Text>
      </View>

      <Text style={styles.seccion}>Detalle</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => irA("/")}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Che-Planner</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inicialUsuario}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#126a5c" />
        </View>
      ) : error ? (
        <View style={styles.centro}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={deudas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDeuda}
          ListHeaderComponent={Header}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No hay deudas pendientes</Text>
              <Text style={styles.emptyText}>
                Todos están a mano por ahora. Agregá un gasto para empezar a dividir.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => irA("/")}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Inicio</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => irA("/")}>
          <Text style={styles.navIcon}>🧭</Text>
          <Text style={styles.navLabel}>Viajes</Text>
        </Pressable>
        <Pressable style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>🧾</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Gastos</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => irA("/")}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Perfil</Text>
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
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#126a5c" },
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

  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  errorText: { color: "#ba1a1a", fontSize: 14, textAlign: "center" },

  listContent: { paddingTop: 8, paddingBottom: 120 },

  hero: { marginHorizontal: 20, marginBottom: 16 },
  heroTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#181c23",
    lineHeight: 40,
    marginBottom: 4,
  },
  heroSubtitle: { fontSize: 16, color: "#3f4946", lineHeight: 24 },

  resumenCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#126a5c",
    shadowColor: "#126a5c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 4,
  },
  resumenLabel: { color: "#cfeae3", fontSize: 13, fontWeight: "600" },
  resumenMonto: { color: "#ffffff", fontSize: 36, fontWeight: "800", marginTop: 4 },
  resumenSub: { color: "#cfeae3", fontSize: 13, marginTop: 4 },

  seccion: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#3f4946",
  },

  deudaCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  deudaLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatares: { flexDirection: "row", marginRight: 12 },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarDeudor: { backgroundColor: "#f4b8b0" },
  avatarAcreedor: { backgroundColor: "#7ecbba", marginLeft: -12 },
  miniAvatarText: { fontWeight: "700", fontSize: 14, color: "#00564a" },
  deudaInfo: { flex: 1 },
  nombres: { fontSize: 14, color: "#181c23" },
  bold: { fontWeight: "700" },
  detalle: { fontSize: 12, color: "#6f7976", marginTop: 2 },
  monto: { fontSize: 16, fontWeight: "800", color: "#126a5c", paddingLeft: 12 },

  emptyState: {
    marginHorizontal: 20,
    marginTop: 48,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  emptyTitle: {
    color: "#0B1C30",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: "#45464D",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
  },

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

export default DeudasScreen;
