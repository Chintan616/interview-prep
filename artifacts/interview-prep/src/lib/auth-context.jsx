import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    const stored = localStorage.getItem("authToken");
    return isTokenValid(stored) ? stored : null;
  });

  const user = token ? parseJwt(token) : null;

  const setToken = (t) => {
    if (t && isTokenValid(t)) {
      localStorage.setItem("authToken", t);
      setTokenState(t);
    } else {
      localStorage.removeItem("authToken");
      setTokenState(null);
    }
  };

  const signOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("sessionId");
    setTokenState(null);
  };

  // Auto-clear expired tokens
  useEffect(() => {
    if (!token) return;
    const payload = parseJwt(token);
    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) { signOut(); return; }
    const timer = setTimeout(signOut, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, setToken, signOut, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
