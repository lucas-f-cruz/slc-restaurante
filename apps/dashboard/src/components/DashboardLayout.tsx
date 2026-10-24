import { useState, type ReactNode } from 'react';
import iconSrc from '../assets/sol-lua-icon.png';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { useClock } from '../lib/useClock';
import { fmtDateLong, fmtTimeFull, initials } from '../lib/format';
import { ThemeToggle } from './ThemeToggle';
import { ROLE_PERMISSIONS, type Permissoes } from '@sol-e-lua/shared';

export type ViewKey = 'overview' | 'orders' | 'kitchen' | 'tables' | 'menu' | 'qrcodes' | 'history' | 'stats' | 'settings';

const NAV_DEFS: Record<ViewKey, { icon: string; label: string; group: string }> = {
  overview: { icon: '📊', label: 'Visão Geral', group: 'Principal' },
  orders: { icon: '🧾', label: 'Pedidos', group: 'Principal' },
  kitchen: { icon: '👨‍🍳', label: 'Cozinha', group: 'Principal' },
  tables: { icon: '🍽️', label: 'Mesas', group: 'Principal' },
  menu: { icon: '📖', label: 'Cardápio', group: 'Restaurante' },
  qrcodes: { icon: '▦', label: 'QR Codes', group: 'Restaurante' },
  history: { icon: '🕘', label: 'Histórico', group: 'Relatórios' },
  stats: { icon: '📈', label: 'Estatísticas', group: 'Relatórios' },
  settings: { icon: '⚙️', label: 'Configurações', group: 'Sistema' }
};

const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', cozinha: 'Cozinha', recepcao: 'Recepção' };

// Quais telas cada papel enxerga na barra lateral
const NAV_BY_ROLE: Record<string, ViewKey[]> = {
  admin: ['overview', 'orders', 'kitchen', 'tables', 'menu', 'qrcodes', 'history', 'stats', 'settings'],
  cozinha: ['kitchen', 'tables'],
  recepcao: ['orders', 'tables', 'history']
};

export function usePermission(): (perm: keyof Permissoes) => boolean {
  const { usuario } = useAuth();
  return (perm) => !!usuario && ROLE_PERMISSIONS[usuario.papel][perm];
}

export function DashboardLayout({
  view, onChangeView, restaurantOpen, notifCount, onOpenNotifications, children
}: {
  view: ViewKey; onChangeView: (v: ViewKey) => void; restaurantOpen: boolean;
  notifCount: number; onOpenNotifications: () => void; children: ReactNode;
}) {
  const { usuario, logout } = useAuth();
  const { isDark } = useTheme();
  const now = useClock();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!usuario) return null;
  const allowed = NAV_BY_ROLE[usuario.papel] ?? [];
  const groups = new Map<string, ViewKey[]>();
  allowed.forEach(key => {
    const g = NAV_DEFS[key].group;
    groups.set(g, [...(groups.get(g) ?? []), key]);
  });

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] min-h-screen bg-[var(--bg)] text-[var(--text)]">
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden" />
        )}
        <aside className={`fixed md:sticky top-0 left-0 h-screen w-[250px] bg-[var(--card)] border-r border-[var(--line)] p-4
          flex flex-col gap-6 z-40 overflow-y-auto transition-transform md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center gap-2.5 px-1.5">
            <img src={iconSrc} alt="Sol e Lua" className="w-8.5 h-8.5 dark:invert dark:brightness-150" />
            <div className="font-display font-bold text-base text-[var(--ink)]">Sol <em className="italic font-medium opacity-70">e</em> Lua <em className="italic font-medium opacity-70">Café</em></div>
          </div>

          {[...groups.entries()].map(([group, items]) => (
            <div key={group} className="flex flex-col gap-0.5">
              <div className="text-[.66rem] font-extrabold uppercase tracking-wider opacity-45 px-3 mb-1.5">{group}</div>
              {items.map(key => (
                <button
                  key={key}
                  onClick={() => { onChangeView(key); setSidebarOpen(false); }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[.86rem] font-semibold text-left
                    ${view === key ? 'bg-[var(--ink)] text-[var(--card)] dark:bg-[var(--accent)] dark:text-[#161F4C]' : 'hover:bg-[var(--bg-2)]'}`}
                >
                  <span className="w-5 text-center">{NAV_DEFS[key].icon}</span>{NAV_DEFS[key].label}
                </button>
              ))}
            </div>
          ))}

          <div className="mt-auto pt-3 border-t border-[var(--line)] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#C46A82] text-white flex items-center justify-center font-extrabold text-[.85rem] flex-shrink-0">
              {initials(usuario.nome)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[.82rem] truncate">{usuario.nome}</div>
              <div className="text-[.7rem] opacity-60">{ROLE_LABEL[usuario.papel]}</div>
            </div>
            <button onClick={logout} title="Sair" className="opacity-50 hover:opacity-100">⏻</button>
          </div>
        </aside>

        <div className="flex flex-col min-w-0">
          <header className="sticky top-0 z-20 bg-[var(--bg)] border-b border-[var(--line)] px-4 md:px-7 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-xl text-[var(--ink)]">☰</button>
              <div>
                <h1 className="font-display font-bold text-lg text-[var(--ink)]">{NAV_DEFS[view].label}</h1>
                <span className="inline-flex items-center gap-1.5 text-[.72rem] font-bold text-[var(--st-pronto)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--st-pronto)] animate-[dotPulse_2s_infinite]" />
                  {restaurantOpen ? 'Restaurante aberto' : 'Restaurante fechado'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3.5 flex-shrink-0">
              <div className="text-right leading-tight hidden sm:block">
                <div className="text-[.72rem] opacity-60 capitalize">{fmtDateLong(now)}</div>
                <div className="font-display font-bold text-lg text-[var(--ink)] tabular-nums">{fmtTimeFull(now)}</div>
              </div>
              <ThemeToggle />
              <button onClick={onOpenNotifications} className="relative w-9.5 h-9.5 rounded-full border border-[var(--line)] bg-[var(--card)] flex items-center justify-center">
                🔔
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--st-recusado)] text-white text-[.6rem] font-extrabold flex items-center justify-center border-2 border-[var(--bg)]">
                    {notifCount}
                  </span>
                )}
              </button>
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[var(--line)]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#C46A82] text-white flex items-center justify-center font-extrabold text-[.7rem]">
                  {initials(usuario.nome)}
                </div>
                <div>
                  <div className="text-[.8rem] font-bold leading-tight">{usuario.nome}</div>
                  <div className="text-[.66rem] opacity-55 leading-tight">{ROLE_LABEL[usuario.papel]}</div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 min-w-0 p-4 md:p-7 pb-16">{children}</main>
        </div>
      </div>
    </div>
  );
}
