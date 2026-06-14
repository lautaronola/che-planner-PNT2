const AUTH_KEY = "@auth_data";
const METHODS = {
  POST: "POST",
  GET: "GET",
  PUT: "PUT",
  DELETE: "DELETE",
};
const LOGIN_URL = "/api/users/login";
const REGISTER_URL = "/api/users/register";

const LOGIN_ERROR = "Error al iniciar sesión";
const REGISTER_ERROR = "Error al registrar usuario";

export {
  AUTH_KEY,
  METHODS,
  LOGIN_URL,
  REGISTER_URL,
  LOGIN_ERROR,
  REGISTER_ERROR,
};
