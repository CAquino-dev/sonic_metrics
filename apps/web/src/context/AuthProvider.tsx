import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { AuthContext } from "./auth-context";

const TOKEN_KEY = "sonic_metrics_token";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const login = useCallback(() => {
    window.location.href =
      "http://127.0.0.1:8000/auth/spotify/login";
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      loading: false,
      login,
      logout,
    }),
    [token, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}