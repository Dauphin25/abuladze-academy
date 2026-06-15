import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, clearToken, getToken } from "./api";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate any stored token on first load.
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((me) => setUsername(me.username))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: !!username,
      username,
      loading,
      async login(u, p) {
        await api.login(u, p);
        const me = await api.me();
        setUsername(me.username);
      },
      logout() {
        clearToken();
        setUsername(null);
      },
    }),
    [username, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
