import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeContext';
import { ToastProvider } from './lib/ToastContext';
import { LiveDataProvider, useLiveData } from './lib/LiveDataContext';
import { createApi } from './lib/api';
import { useWebSocket } from './lib/useWebSocket';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout, type ViewKey } from './components/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { OrdersPage } from './pages/OrdersPage';
import { KitchenPage } from './pages/KitchenPage';
import { TablesPage } from './pages/TablesPage';
import { MenuAdminPage } from './pages/MenuAdminPage';
import { QRCodesPage } from './pages/QRCodesPage';
import { HistoryPage } from './pages/HistoryPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotifDropdown } from './components/NotifDropdown';
import { OrderDetailModal } from './components/OrderDetailModal';

function AuthedApp() {
  const [view, setView] = useState<ViewKey>('overview');
  const [notifOpen, setNotifOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [restaurantOpen, setRestaurantOpen] = useState(true);
  const { token } = useAuth();
  const { pedidos, mesas, notifications, unreadCount, markAllRead, advanceStatus } = useLiveData();

  useEffect(() => { createApi(token).getConfiguracoes().then(c => setRestaurantOpen(c.restaurantOpen)); }, [token]);

  useWebSocket(event => {
    if (event.type === 'configuracao:atualizada') setRestaurantOpen(event.payload.restaurantOpen);
  }, token);

  const pedidoDetalhe = detailId ? pedidos.find(p => p.id === detailId) ?? null : null;

  function goto(v: ViewKey) { setView(v); }

  return (
    <DashboardLayout
      view={view}
      onChangeView={setView}
      restaurantOpen={restaurantOpen}
      notifCount={unreadCount}
      onOpenNotifications={() => { setNotifOpen(o => !o); if (!notifOpen) markAllRead(); }}
    >
      {view === 'overview' && <OverviewPage onOpenDetail={setDetailId} />}
      {view === 'orders' && <OrdersPage onOpenDetail={setDetailId} />}
      {view === 'kitchen' && <KitchenPage />}
      {view === 'tables' && <TablesPage onOpenOrder={setDetailId} />}
      {view === 'menu' && <MenuAdminPage />}
      {view === 'qrcodes' && <QRCodesPage />}
      {view === 'history' && <HistoryPage onOpenDetail={setDetailId} />}
      {view === 'stats' && <StatsPage />}
      {view === 'settings' && <SettingsPage onGoto={goto} />}

      {notifOpen && (
        <NotifDropdown
          notifications={notifications}
          onSelect={id => { setNotifOpen(false); setDetailId(id); }}
          onClose={() => setNotifOpen(false)}
        />
      )}
      {pedidoDetalhe && (
        <OrderDetailModal pedido={pedidoDetalhe} onClose={() => setDetailId(null)} onAdvance={advanceStatus} />
      )}
      <span className="hidden">{mesas.length}</span>
    </DashboardLayout>
  );
}

function AppInner() {
  const { token, usuario } = useAuth();
  if (!token || !usuario) return <LoginPage />;
  return (
    <LiveDataProvider>
      <AuthedApp />
    </LiveDataProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
