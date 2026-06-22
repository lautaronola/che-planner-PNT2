import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "expo-router";
import tripService from "../../services/tripService";
import { useState, useEffect } from "react";

function HomeScreen() {
  const { auth, setAuth } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await tripService.getTrips(auth?.token);
        if (!activo) return;
        setTrips(data);
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
  }, [auth?.token]);

  const renderTrip = ({ item }) => (
    <Pressable
      style={styles.viajeCard}
      onPress={() =>
        router.push(
          `/detalle-viaje?tripId=${item._id}&tripName=${encodeURIComponent(item.name)}`,
        )
      }
    >
      <View style={styles.viajeInfo}>
        <Text style={styles.viajeNombre} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.viajeDestino} numberOfLines={1}>
          {item.destination || "Sin destino definido"}
        </Text>
        <Text style={styles.viajeMiembros}>
          {item.members?.length || 0}{" "}
          {item.members?.length === 1 ? "integrante" : "integrantes"}
        </Text>
      </View>
      <View style={styles.viajeRight}>
        <View
          style={[styles.estadoBadge, !item.status && styles.estadoCerrado]}
        >
          <Text style={styles.estadoTexto}>
            {item.status ? "Activo" : "Cerrado"}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );

  const ListHeader = (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Tus Viajes</Text>
        <Text style={styles.heroSubtitle}>
          Tocá un viaje para ver los gastos.
        </Text>
      </View>
      <Text style={styles.seccion}>
        {trips.length} {trips.length === 1 ? "viaje" : "viajes"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/che-planer-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Che-Planner</Text>
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
          data={trips}
          keyExtractor={(item) => item._id}
          renderItem={renderTrip}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tenés viajes todavía</Text>
              <Text style={styles.emptyText}>
                Creá tu primer viaje y empezá a dividir gastos con tu grupo.
              </Text>
              <Pressable
                style={styles.botonCrear}
                onPress={() => router.push("/nuevo-viaje")}
              >
                <Text style={styles.botonCrearTexto}>Crear viaje</Text>
              </Pressable>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!loading && !error && trips.length > 0 && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/nuevo-viaje")}
        >
          <Text style={styles.fabTexto}>Nuevo viaje</Text>
        </Pressable>
      )}

      <View style={styles.bottomNav}>
        <Pressable style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Inicio</Text>
        </Pressable>
        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/nuevo-viaje")}
        >
          <Text style={styles.navIcon}>✈️</Text>
          <Text style={styles.navLabel}>Nuevo viaje</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => setAuth(null)}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Salir</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9ff" },
  header: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logo: {
    width: 48,
    height: 48,
  },
  headerTitle: { fontSize: 13, fontWeight: "700", color: "#126a5c", marginTop: 2 },

  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
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

  seccion: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#3f4946",
  },

  viajeCard: {
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
  viajeInfo: { flex: 1 },
  viajeNombre: { fontSize: 16, fontWeight: "700", color: "#181c23" },
  viajeDestino: { fontSize: 13, color: "#6f7976", marginTop: 2 },
  viajeMiembros: { fontSize: 12, color: "#3f4946", marginTop: 6 },
  viajeRight: { alignItems: "center", gap: 4 },
  estadoBadge: {
    backgroundColor: "#d4f0e8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  estadoCerrado: { backgroundColor: "#f0d4d4" },
  estadoTexto: { fontSize: 11, fontWeight: "600", color: "#126a5c" },
  chevron: { fontSize: 22, color: "#6f7976", marginTop: 2 },

  emptyState: {
    marginHorizontal: 20,
    marginTop: 48,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  emptyTitle: {
    color: "#181c23",
    marginBottom: 24,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  logout: { color: "#126a5c", fontWeight: "600" },
  emptyText: {
    color: "#45464D",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
  },
  botonCrear: {
    marginTop: 20,
    backgroundColor: "#126a5c",
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  botonCrearTexto: { color: "#ffffff", fontWeight: "700", fontSize: 15 },

  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "#126a5c",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#126a5c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  fabTexto: { color: "#ffffff", fontWeight: "700", fontSize: 14 },

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

export default HomeScreen;
