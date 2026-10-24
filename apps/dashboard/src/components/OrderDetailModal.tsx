import { NEXT_STATUS, NEXT_STATUS_LABEL, STATUS_LABEL, type Pedido } from '@sol-e-lua/shared';
import { money, pad2 } from '../lib/format';
import { CategorizedItems } from './OrderCard';
import { Modal } from '../pages/TablesPage';

const STATUS_COLOR: Record<Pedido['status'], string> = {
  novo: 'var(--st-novo)', preparando: 'var(--st-preparando)', pronto: 'var(--st-pronto)',
  entregue: 'var(--st-entregue)', finalizado: 'var(--st-finalizado)'
};

export function OrderDetailModal({ pedido, onClose, onAdvance }: { pedido: Pedido; onClose: () => void; onAdvance: (id: number) => void }) {
  const next = pedido.status === 'finalizado' ? null : NEXT_STATUS[pedido.status as keyof typeof NEXT_STATUS];
  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-xl text-[var(--ink)] mb-1">Pedido #{pedido.id}</h2>
      <div className="text-[.78rem] opacity-60 mb-3">Mesa {pad2(pedido.mesaId)} · 👤 {pedido.clienteNome}</div>
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[.68rem] font-extrabold uppercase text-white mb-4" style={{ background: STATUS_COLOR[pedido.status] }}>
        {STATUS_LABEL[pedido.status]}
      </span>
      <CategorizedItems itens={pedido.itens} />
      {pedido.observacao && <div className="text-[.78rem] italic opacity-75 bg-[var(--bg-2)] px-2.5 py-2 rounded-lg my-3">"{pedido.observacao}"</div>}
      <div className="flex justify-between font-extrabold text-lg text-[var(--ink)] my-4">
        <span>Total</span><span>{money(pedido.total)}</span>
      </div>
      <h3 className="text-[.9rem] font-bold mb-2">Linha do tempo</h3>
      <div className="flex flex-col gap-2.5">
        {pedido.timeline.map((t, i) => (
          <div key={i} className="flex gap-2.5 text-[.78rem] items-baseline">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0 mt-1" />
            <span className="font-extrabold text-[var(--ink)] min-w-[42px]">
              {new Date(t.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>{t.status}</span>
          </div>
        ))}
      </div>
      {next && (
        <button onClick={() => onAdvance(pedido.id)} className="mt-4 px-4 py-2 rounded-[10px] font-bold text-[.82rem] bg-[var(--ink)] text-[var(--card)] dark:bg-[var(--accent)] dark:text-[#161F4C]">
          {NEXT_STATUS_LABEL[pedido.status as keyof typeof NEXT_STATUS_LABEL]}
        </button>
      )}
    </Modal>
  );
}
