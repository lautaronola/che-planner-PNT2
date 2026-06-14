import AsyncStorage from "@react-native-async-storage/async-storage";

const store = async (key, value) => {
  const jsonValue = JSON.stringify(value);
  await AsyncStorage.setItem(key, jsonValue);
};

const get = async (key) => {
  const jsonValue = await AsyncStorage.getItem(key);
  return jsonValue != null ? JSON.parse(jsonValue) : null;
};

const clear = async () => {
  await AsyncStorage.clear();
};

export default { store, get, clear };
