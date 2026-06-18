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
const CREATE_TRIP_URL = "/api/trips";
const ADD_MEMBER_URL = "/api/trips/:tripId/members";
const SEARCH_USERS_URL = "/api/users";

const LOGIN_ERROR = "Error al iniciar sesión";
const REGISTER_ERROR = "Error al registrar usuario";
const CREATE_TRIP_ERROR = "Error al crear el viaje";
const ADD_MEMBER_ERROR = "Error al invitar al integrante";
const SEARCH_USERS_ERROR = "Error al buscar usuarios";

export {
  AUTH_KEY,
  METHODS,
  LOGIN_URL,
  REGISTER_URL,
  CREATE_TRIP_URL,
  ADD_MEMBER_URL,
  SEARCH_USERS_URL,
  LOGIN_ERROR,
  REGISTER_ERROR,
  CREATE_TRIP_ERROR,
  ADD_MEMBER_ERROR,
  SEARCH_USERS_ERROR,
}