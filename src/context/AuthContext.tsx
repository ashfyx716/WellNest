import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserMe } from "@/services/authService";
import { authService, type Role } from "@/services/authService";

type AuthState = {
  user: UserMe | null;
  token: string | null;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  setRole: (role: "MOTHER" | "FAMILY") => Promise<void>;
  continueGuest: () => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "wellnest_token";
const USER_KEY = "wellnest_user";
const GUEST_KEY = "wellnest_guest";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === "true");
  const [loading, setLoading] = useState(true);

  const persist = useCallback((t: string | null, u: UserMe | null) => {
    setToken(t);
    setUser(u);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    try {
      const me = await authService.me();
      setUser(me);
      localStorage.setItem(USER_KEY, JSON.stringify(me));
    } catch {
      persist(null, null);
      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
    } finally {
      setLoading(false);
    }
  }, [persist]);

  useEffect(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as UserMe);
      } catch {
        /* ignore */
      }
    }
    if (localStorage.getItem(TOKEN_KEY)) {
      void refreshMe();
    } else {
      setLoading(false);
    }
  }, [refreshMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authService.login({ email, password });
      persist(data.token, data.user);
      setIsGuest(false);
      localStorage.removeItem(GUEST_KEY);
    },
    [persist]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const data = await authService.signup({ name, email, password, phone });
      persist(data.token, data.user);
      setIsGuest(false);
      localStorage.removeItem(GUEST_KEY);
    },
    [persist]
  );

  const setRoleFn = useCallback(
    async (role: "MOTHER" | "FAMILY") => {
      const me = await authService.setRole(role);
      setUser(me);
      localStorage.setItem(USER_KEY, JSON.stringify(me));
    },
    []
  );

  const continueGuest = useCallback(() => {
    persist(null, {
      id: 0,
      name: "Guest",
      email: "",
      phone: "",
      role: "GUEST",
      linkedMotherId: null,
    });
    setIsGuest(true);
    localStorage.setItem(GUEST_KEY, "true");
  }, [persist]);

  const logout = useCallback(() => {
    persist(null, null);
    setIsGuest(false);
    localStorage.removeItem(GUEST_KEY);
  }, [persist]);

  const value = useMemo(
    () =>
      ({
        user,
        token,
        isGuest,
        loading,
        login,
        signup,
        setRole: setRoleFn,
        continueGuest,
        logout,
        refreshMe,
      }) satisfies AuthState,
    [user, token, isGuest, loading, login, signup, setRoleFn, continueGuest, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth requires AuthProvider");
  return ctx;
}

export function roleRedirectPath(role: Role, isGuest: boolean): string {
  if (isGuest || role === "GUEST") return "/dashboard";
  if (role === "FAMILY") return "/family";
  return "/dashboard";
}
