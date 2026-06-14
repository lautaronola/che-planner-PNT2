import {
  METHODS,
  LOGIN_URL,
  REGISTER_URL,
  LOGIN_ERROR,
  REGISTER_ERROR,
} from "../constants/index";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}${LOGIN_URL}`, {
    method: METHODS.POST,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || LOGIN_ERROR);
  }

  return data;
};

const register = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}${REGISTER_URL}`, {
    method: METHODS.POST,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || REGISTER_ERROR);
  }

  return data;
};

export default { login, register };
