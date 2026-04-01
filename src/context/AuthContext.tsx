import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMe, loginAdmin, logoutAdmin, type AuthLoginBody } from '../api/authApi';

export type AuthUser = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginError: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      let admin = await getMe();
      if (admin === undefined) {
        await new Promise((r) => setTimeout(r, 250));
        admin = await getMe();
      }
      if (admin === undefined) {
        /* Still unknown — avoid logging out a valid cookie/token session on flaky networks. */
      } else if (admin) {
        setUser({ id: admin.id, email: admin.email });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoginError(null);
      try {
        const body: AuthLoginBody = { email, password };
        const res = await loginAdmin(body);
        setUser({ id: res.admin.id, email: res.admin.email });
        return true;
      } catch (e) {
        let msg = e instanceof Error ? e.message : 'Login failed';
        if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('Load failed')) {
          msg =
            'Cannot reach the API. In dev, remove VITE_API_BASE so /api is proxied to the backend; or set FRONTEND_ORIGIN if calling the API directly.';
        }
        setLoginError(msg);
        setUser(null);
        return false;
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, loginError }), [user, loading, login, logout, loginError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
