import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Usuario } from '@sol-e-lua/shared';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
}

interface AuthContextValue extends AuthState {
  login: (usuario: string, senha: string) => Promise<void>;
  logout: () => void;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'sol-e-lua-session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, usuario: null });
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setState(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  async function login(usuario: string, senha: string) {
    setLoginError(null);
    const res = await fetch('/api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Erro ao entrar' }));
      setLoginError(body.error ?? 'Erro ao entrar');
      throw new Error(body.error);
    }
    const data = await res.json();
    const next: AuthState = { token: data.token, usuario: data.usuario };
    setState(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function logout() {
    setState({ token: null, usuario: null });
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, loginError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
