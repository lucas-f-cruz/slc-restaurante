import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface CartLine { produtoId: string; quantidade: number; }

interface SessionState {
  mesaId: number | null;
  clienteNome: string;
  isDark: boolean;
  cart: Record<string, number>; // produtoId -> quantidade
}

interface SessionContextValue extends SessionState {
  setIdentificacao: (mesaId: number, clienteNome: string) => void;
  toggleTheme: () => void;
  addToCart: (produtoId: string, delta: number) => void;
  clearCart: () => void;
  cartLines: CartLine[];
  cartCount: number;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    mesaId: null, clienteNome: '', isDark: false, cart: {}
  });

  const setIdentificacao = (mesaId: number, clienteNome: string) =>
    setState(s => ({ ...s, mesaId, clienteNome }));

  const toggleTheme = () => setState(s => ({ ...s, isDark: !s.isDark }));

  const addToCart = (produtoId: string, delta: number) =>
    setState(s => {
      const next = (s.cart[produtoId] ?? 0) + delta;
      const cart = { ...s.cart };
      if (next <= 0) delete cart[produtoId]; else cart[produtoId] = next;
      return { ...s, cart };
    });

  const clearCart = () => setState(s => ({ ...s, cart: {} }));

  const cartLines = useMemo(
    () => Object.entries(state.cart).map(([produtoId, quantidade]) => ({ produtoId, quantidade })),
    [state.cart]
  );
  const cartCount = cartLines.reduce((sum, l) => sum + l.quantidade, 0);

  const value: SessionContextValue = {
    ...state, setIdentificacao, toggleTheme, addToCart, clearCart, cartLines, cartCount
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession precisa estar dentro de <SessionProvider>');
  return ctx;
}
