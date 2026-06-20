const AUTH_KEY = "@auth_data";
const METHODS = {
  POST: "POST",
  GET: "GET",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};
const LOGIN_URL = "/api/users/login";
const REGISTER_URL = "/api/users/register";
const TRIPS_URL = "/api/trips";
const ADD_MEMBER_URL = "/api/trips/:tripId/members";
const SEARCH_USERS_URL = "/api/users";
const TRIP_SUMMARY_URL = "/api/trips/:tripId/summary";

const LOGIN_ERROR = "Error al iniciar sesión";
const REGISTER_ERROR = "Error al registrar usuario";
const CREATE_TRIP_ERROR = "Error al crear el viaje";
const GET_TRIPS_ERROR = "Error al obtener los viajes";
const ADD_MEMBER_ERROR = "Error al invitar al integrante";
const SEARCH_USERS_ERROR = "Error al buscar usuarios";
const TRIP_SUMMARY_ERROR = "Error al obtener el resumen del viaje";

export {
  AUTH_KEY,
  METHODS,
  LOGIN_URL,
  REGISTER_URL,
  TRIPS_URL,
  ADD_MEMBER_URL,
  SEARCH_USERS_URL,
  TRIP_SUMMARY_URL,
  LOGIN_ERROR,
  REGISTER_ERROR,
  CREATE_TRIP_ERROR,
  GET_TRIPS_ERROR,
  ADD_MEMBER_ERROR,
  SEARCH_USERS_ERROR,
  TRIP_SUMMARY_ERROR,
};
