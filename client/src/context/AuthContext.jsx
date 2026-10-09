import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));
  // true right after the user clicks "Log out", so protected pages go home instead of to /login
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.set(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api("/auth/login", { method: "POST", body: { email, password } });
    tokenStore.set(d.token);
    setLoggedOut(false);
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async (payload) => {
    const d = await api("/auth/register", { method: "POST", body: payload });
    tokenStore.set(d.token);
    setLoggedOut(false);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.set(null);
    setLoggedOut(true);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loggedOut, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const homeFor = (user) => (user && user.role !== "customer" ? "/dashboard" : "/my-bookings");
