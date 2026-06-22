import {
  METHODS,
  ADD_MEMBER_URL,
  ADD_MEMBER_ERROR,
  TRIPS_URL,
  CREATE_TRIP_ERROR,
  TRIP_SUMMARY_URL,
  TRIP_SUMMARY_ERROR,
  GET_TRIPS_ERROR,
  ADD_EXPENSE_URL,
  ADD_EXPENSE_ERROR,
} from "../constants/index";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const addMember = async (tripId, email, token) => {
  const url = `${BASE_URL}${ADD_MEMBER_URL.replace(":tripId", tripId)}`;

  let response;
  try {
    response = await fetch(url, {
      method: METHODS.PATCH,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    // Error de red: el back no respondió
    throw new Error("Network request failed");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("El servidor devolvió una respuesta inválida");
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || ADD_MEMBER_ERROR);
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

const getTrips = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}${TRIPS_URL}`, {
      method: METHODS.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || GET_TRIPS_ERROR);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting trips:", error);
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

const closeTrip = async (tripId, token) => {
  const url = `${BASE_URL}/api/trips/${tripId}/close`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Error al cerrar el viaje");
  return data;
};

const addPayment = async (tripId, toEmail, amount, token) => {
  const url = `${BASE_URL}/api/payments`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tripId, to: toEmail, amount }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.message || "Error al registrar el pago");
  return data;
};

const addExpense = async (
  tripId,
  description,
  totalAmount,
  paidBy,
  splitBetween,
  token,
) => {
  const url = `${BASE_URL}${ADD_EXPENSE_URL}`;
  const response = await fetch(url, {
    method: METHODS.POST,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tripId,
      description,
      totalAmount,
      paidBy,
      splitBetween,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || ADD_EXPENSE_ERROR);
  return data;
};

export default {
  addMember,
  createViaje,
  getTrips,
  getTripSummary,
  closeTrip,
  addPayment,
  addExpense,
};
