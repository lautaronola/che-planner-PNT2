import { AUTH_KEY, METHODS, LOGIN_URL } from "../constants/index";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}${LOGIN_URL}`, {
    method: METHODS.POST,
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || LOGIN_ERROR);
  }

  await storageService.store(AUTH_KEY, data);

  return data;
};

export default { login };
