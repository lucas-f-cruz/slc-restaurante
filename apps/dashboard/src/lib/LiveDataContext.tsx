import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { MesaComStatus, Pedido } from '@sol-e-lua/shared';
import { useAuth } from './AuthContext';
import { createApi } from './api';
import { useWebSocket } from './useWebSocket';
import { playNotifSound } from './sound';

interface Notification { id: string; pedidoId: number; mesaId: number; cliente: string; itens: number; time: string; read: boolean; }

interface LiveDataValue {
  pedidos: Pedido[];
  mesas: MesaComStatus[];
  loading: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  advanceStatus: (id: number) => Promise<void>;
  refreshMesas: () => Promise<void>;
  refreshPedidos: () => Promise<void>;
}

const LiveDataContext = createContext<LiveDataValue | null>(null);

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const api = createApi(token);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mesas, setMesas] = useState<MesaComStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshPedidos = useCallback(async () => { setPedidos(await api.getPedidos()); }, [token]);
  const refreshMesas = useCallback(async () => { setMesas(await api.getMesas()); }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([api.getPedidos(), api.getMesas()])
      .then(([p, m]) => { setPedidos(p); setMesas(m); })
      .finally(() => setLoading(false));
  }, [token]);

  useWebSocket(event => {
    if (event.type === 'pedido:novo') {
      playNotifSound();
      setPedidos(prev => prev.some(p => p.id === event.payload.id) ? prev : [...prev, event.payload]);
      setNotifications(prev => [{
        id: crypto.randomUUID(), pedidoId: event.payload.id, mesaId: event.payload.mesaId,
        cliente: event.payload.clienteNome, itens: event.payload.itens.length,
        time: new Date(event.payload.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        read: false
      }, ...prev].slice(0, 20));
    } else if (event.type === 'pedido:status') {
      setPedidos(prev => prev.map(p => p.id === event.payload.pedidoId
        ? { ...p, status: event.payload.status, timeline: event.payload.timeline.map(t => ({ status: t.status, criadoEm: t.criadoEm })) }
        : p));
    } else if (event.type === 'mesa:atualizada') {
      setMesas(prev => {
        const exists = prev.some(m => m.id === event.payload.id);
        return exists ? prev.map(m => m.id === event.payload.id ? event.payload : m) : [...prev, event.payload];
      });
    }
  }, token);

  async function advanceStatus(id: number) {
    const updated = await api.avancarStatus(id);
    setPedidos(prev => prev.map(p => p.id === id ? updated : p));
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <LiveDataContext.Provider value={{ pedidos, mesas, loading, notifications, unreadCount, markAllRead, advanceStatus, refreshMesas, refreshPedidos }}>
      {children}
    </LiveDataContext.Provider>
  );
}

export function useLiveData() {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error('useLiveData precisa estar dentro de <LiveDataProvider>');
  return ctx;
}
