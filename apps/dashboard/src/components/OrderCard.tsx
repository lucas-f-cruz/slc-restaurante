import { User } from 'lucide-react';
import { CATEGORIA_META, NEXT_STATUS, NEXT_STATUS_LABEL, STATUS_LABEL, type Pedido, type CategoriaChave } from '@sol-e-lua/shared';
import { fmtTimeShort, minutesAgo, money, pad2, timeAgoLabel, waitColor } from '../lib/format';
import { CATEGORY_ICON } from '../lib/categoryIcons';

const STATUS_COLOR: Record<Pedido['status'], string> = {
  novo: 'var(--st-novo)', preparando: 'var(--st-preparando)', pronto: 'var(--st-pronto)',
  entregue: 'var(--st-entregue)', finalizado: 'var(--st-finalizado)'
};

export function CategorizedItems({ itens }: { itens: Pedido['itens'] }) {
  const groups = new Map<CategoriaChave, Pedido['itens']>();
  itens.forEach(it => {
    const key = it.categoriaChave as CategoriaChave;
    groups.set(key, [...(groups.get(key) ?? []), it]);
  });
  return (
    <>
      {[...groups.entries()].map(([cat, its]) => {
        const meta = CATEGORIA_META[cat];
        const Icon = CATEGORY_ICON[cat];
        return (
          <div key={cat} className="mb-2">
            <div className="inline-flex items-center gap-1.5 text-[.68rem] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md text-white mb-1"
              style={{ background: meta.hex }}>
              <Icon size={11} strokeWidth={2.5} /> {meta.label.toUpperCase()}
            </div>
            <div className="text-[.84rem] leading-relaxed pl-0.5">
              {its.map(it => <div key={it.id}>{it.quantidade}x {it.nomeProduto}</div>)}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function OrderCard({ pedido, now, onAdvance, onOpenDetail }: {
  pedido: Pedido; now: Date; onAdvance: (id: number) => void; onOpenDetail: (id: number) => void;
}) {
  const mins = minutesAgo(pedido.criadoEm, now);
  const wc = waitColor(mins);
  const next = pedido.status === 'finalizado' ? null : NEXT_STATUS[pedido.status as keyof typeof NEXT_STATUS];

  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] p-4.5 flex flex-col gap-2.5"
      style={{ borderLeft: `4px solid ${STATUS_COLOR[pedido.status]}` }}>
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <div className="font-display font-bold text-base text-[var(--ink)]">
            Pedido #{pedido.id} <span className="font-semibold text-[.8rem] opacity-60">· Mesa {pad2(pedido.mesaId)}</span>
          </div>
          <div className="text-[.76rem] opacity-60 flex gap-2 items-center flex-wrap">
            <span className="font-bold opacity-85 inline-flex items-center gap-1"><User size={12} strokeWidth={2.5} /> {pedido.clienteNome}</span> ·
            <span>{fmtTimeShort(pedido.criadoEm)}</span> ·
            <span>{timeAgoLabel(pedido.criadoEm, now)}</span>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: wc.color }} />
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[.68rem] font-extrabold uppercase text-white" style={{ background: STATUS_COLOR[pedido.status] }}>
          {STATUS_LABEL[pedido.status]}
        </span>
      </div>

      <CategorizedItems itens={pedido.itens} />
      {pedido.observacao && <div className="text-[.78rem] italic opacity-75 bg-[var(--bg-2)] px-2.5 py-2 rounded-lg">"{pedido.observacao}"</div>}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-extrabold text-[var(--accent)]">{money(pedido.total)}</div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => onOpenDetail(pedido.id)} className="px-3 py-1.5 rounded-[10px] border border-[var(--line)] text-[.74rem] font-bold">Ver detalhes</button>
          {next && (
            <button onClick={() => onAdvance(pedido.id)} className="px-3 py-1.5 rounded-[10px] text-[.74rem] font-bold bg-[var(--ink)] text-[var(--card)] dark:bg-[var(--accent)] dark:text-[#161F4C]">
              {NEXT_STATUS_LABEL[pedido.status as keyof typeof NEXT_STATUS_LABEL]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
