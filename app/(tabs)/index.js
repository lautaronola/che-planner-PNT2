import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../../hooks/useAuth";

function HomeScreen() {
  const { auth, setAuth } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hola, {auth?.user?.name}!</Text>
      <Pressable onPress={() => setAuth(null)}>
        <Text style={styles.logout}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9ff",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: "#181c23",
    marginBottom: 24,
  },
  logout: { color: "#126a5c", fontWeight: "600" },
});

export default HomeScreen;
