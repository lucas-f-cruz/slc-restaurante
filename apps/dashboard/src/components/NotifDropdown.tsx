import { pad2 } from '../lib/format';

interface Notification { id: string; pedidoId: number; mesaId: number; cliente: string; itens: number; time: string; read: boolean; }

export function NotifDropdown({ notifications, onSelect, onClose }: {
  notifications: Notification[]; onSelect: (pedidoId: number) => void; onClose: () => void;
}) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-30" />
      <div className="absolute top-[62px] right-4 md:right-7 w-[320px] max-h-[400px] overflow-y-auto bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-2xl z-40">
        <div className="px-4 py-3.5 font-extrabold text-[.82rem] border-b border-[var(--line)]">Notificações</div>
        {notifications.length === 0 ? (
          <div className="px-4 py-3 text-[.78rem] opacity-60">Nenhuma notificação ainda.</div>
        ) : notifications.map(n => (
          <div key={n.id} onClick={() => onSelect(n.pedidoId)} className="px-4 py-3 border-b border-[var(--line)] last:border-0 cursor-pointer hover:bg-[var(--bg-2)] text-[.78rem]">
            <div className="font-bold">🔔 Novo pedido — Mesa {pad2(n.mesaId)}</div>
            <div className="opacity-60 mt-0.5">Pedido #{n.pedidoId} · 👤 {n.cliente} · {n.itens} itens · {n.time}</div>
          </div>
        ))}
      </div>
    </>
  );
}
