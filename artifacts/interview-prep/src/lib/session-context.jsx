import { createContext, useContext, useState } from "react";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessionId, setSessionIdState] = useState(
    () => localStorage.getItem("sessionId") ?? null
  );

  const setSessionId = (id) => {
    if (id) {
      localStorage.setItem("sessionId", id);
    } else {
      localStorage.removeItem("sessionId");
    }
    setSessionIdState(id);
  };

  const clearSession = () => setSessionId(null);

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
