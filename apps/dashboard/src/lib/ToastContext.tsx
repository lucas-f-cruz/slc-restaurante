import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface ToastItem { id: number; message: string; tone: 'success' | 'info' | 'danger'; }

const ToastContext = createContext<((message: string, tone?: ToastItem['tone']) => void) | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, tone: ToastItem['tone'] = 'success') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5">
        {toasts.map(t => (
          <div key={t.id}
            className={`px-4.5 py-3 rounded-2xl text-[.82rem] font-bold shadow-lg min-w-[240px] animate-[toastIn_.35s_cubic-bezier(.34,1.4,.64,1)]
              ${t.tone === 'danger' ? 'bg-[var(--st-recusado)] text-white' : 'bg-[var(--ink)] text-[var(--card)] dark:bg-[var(--accent)] dark:text-[#161F4C]'}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
