import { createContext, useContext, useState, useEffect } from "react";
import storageService from "../services/storageService";
import { AUTH_KEY } from "../constants/index";

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storageService
      .get(AUTH_KEY)
      .then((savedAuth) => {
        if (savedAuth) setAuth(savedAuth);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (auth) {
        storageService.store(AUTH_KEY, auth);
      } else {
        storageService.clear();
      }
    }
  }, [auth]);

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth, AuthProvider };
