import {
  METHODS,
  ADD_MEMBER_URL,
  ADD_MEMBER_ERROR,
  TRIPS_URL,
  CREATE_TRIP_ERROR,
  TRIP_SUMMARY_URL,
  TRIP_SUMMARY_ERROR,
} from "../constants/index";

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

const createViaje = async (nombre, destino, token) => {
  try {
    const body = { name: nombre, destination: destino };
    const response = await fetch(`${BASE_URL}${TRIPS_URL}`, {
      method: METHODS.POST,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || CREATE_TRIP_ERROR);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating trip:", error);
    throw error;
  }
};

const getTripSummary = async (tripId, token) => {
  try {
    const url = `${BASE_URL}${TRIP_SUMMARY_URL.replace(":tripId", tripId)}`;
    const response = await fetch(url, {
      method: METHODS.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || TRIP_SUMMARY_ERROR);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting trip summary:", error);
    throw error;
  }
};

export default { addMember, createViaje, getTripSummary };
