import { createContext } from "react";

export interface AuthContextValue {
  token: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);