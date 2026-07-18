import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, login as storeLogin, logout as storeLogout, seedIfEmpty } from "../lib/store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty();
    setUser(getCurrentUser());
    setReady(true);
  }, []);

  function login(username, password) {
    const res = storeLogin(username, password);
    if (res.ok) setUser(res.user);
    return res;
  }

  function logout() {
    storeLogout();
    setUser(null);
  }

  function refresh() {
    setUser(getCurrentUser());
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
