import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'legalnotion_admin_auth';

export type AuthUser = {
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && 'email' in parsed && typeof (parsed as AuthUser).email === 'string') {
      return { email: (parsed as AuthUser).email };
    }
    return null;
  } catch {
    return null;
  }
}

function expectedCredentials() {
  const email = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim() || 'admin@legalnotion.local';
  const password = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || 'admin123';
  return { email, password };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const login = useCallback((email: string, password: string) => {
    const { email: expectedEmail, password: expectedPassword } = expectedCredentials();
    const ok =
      email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword;
    if (!ok) return false;
    const next: AuthUser = { email: email.trim() };
    setUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
