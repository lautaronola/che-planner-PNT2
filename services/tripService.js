import { METHODS, ADD_MEMBER_URL, ADD_MEMBER_ERROR } from "../constants/index";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const addMember = async (tripId, email, token) => {
  const url = `${BASE_URL}${ADD_MEMBER_URL.replace(":tripId", tripId)}`;

  const response = await fetch(url, {
    method: METHODS.PATCH,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || ADD_MEMBER_ERROR);
  }

  return data;
};

export default { addMember };