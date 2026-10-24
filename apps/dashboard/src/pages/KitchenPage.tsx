import { useState } from 'react';
import { LayoutGrid, Clock3, AlertTriangle } from 'lucide-react';
import { CATEGORIA_META, type CategoriaChave, type StatusPedido } from '@sol-e-lua/shared';
import { useLiveData } from '../lib/LiveDataContext';
import { useClock } from '../lib/useClock';
import { minutesAgo, pad2, timeAgoLabel, waitColor } from '../lib/format';
import { CategorizedItems } from '../components/OrderCard';
import { CategoryButton } from '../components/CategoryButton';
import { CATEGORY_ICON } from '../lib/categoryIcons';

const COLS: { status: StatusPedido; title: string; action: string }[] = [
  { status: 'novo', title: 'Novos', action: 'INICIAR PREPARO' },
  { status: 'preparando', title: 'Em preparo', action: 'MARCAR COMO PRONTO' },
  { status: 'pronto', title: 'Prontos', action: 'ENTREGUE' }
];

export function KitchenPage() {
  const { pedidos, advanceStatus } = useLiveData();
  const now = useClock();
  const [filter, setFilter] = useState<'todos' | CategoriaChave>('todos');
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyLate, setOnlyLate] = useState(false);

  let visiveis = pedidos.filter(p => p.status === 'novo' || p.status === 'preparando' || p.status === 'pronto');
  if (filter !== 'todos') visiveis = visiveis.filter(p => p.itens.some(it => it.categoriaChave === filter));
  if (onlyNew) visiveis = visiveis.filter(p => p.status === 'novo');
  if (onlyLate) visiveis = visiveis.filter(p => minutesAgo(p.criadoEm, now) >= 10);

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 mb-5">
        <CategoryButton icon={LayoutGrid} label="Todos" active={filter === 'todos'} accent="#5C2A1E" onClick={() => setFilter('todos')} size="sm" />
        {Object.entries(CATEGORIA_META).map(([key, meta]) => (
          <CategoryButton
            key={key} icon={CATEGORY_ICON[key as CategoriaChave]} label={meta.label}
            active={filter === key} accent={meta.hex} onClick={() => setFilter(key as CategoriaChave)} size="sm"
          />
        ))}
        <CategoryButton icon={Clock3} label="Somente pedidos novos" active={onlyNew} accent="#4F8FE8" onClick={() => setOnlyNew(v => !v)} size="sm" />
        <CategoryButton icon={AlertTriangle} label="Somente pedidos atrasados" active={onlyLate} accent="#C1502E" onClick={() => setOnlyLate(v => !v)} size="sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {COLS.map(col => {
          const colOrders = visiveis.filter(p => p.status === col.status).sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime());
          return (
            <div key={col.status} className="bg-[var(--bg-2)] rounded-[20px] p-3.5">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-extrabold text-[.85rem] uppercase tracking-wide">{col.title}</span>
                <span className="bg-[var(--card)] rounded-full px-2.5 py-0.5 text-[.72rem] font-extrabold">{colOrders.length}</span>
              </div>
              {colOrders.length === 0 ? (
                <div className="text-center py-6 opacity-50 text-[.78rem]">Nenhum pedido aqui</div>
              ) : colOrders.map(p => {
                const wc = waitColor(minutesAgo(p.criadoEm, now));
                return (
                  <div key={p.id} className="bg-[var(--card)] rounded-xl p-3.5 mb-2.5 border border-[var(--line)]">
                    <div className="flex justify-between font-extrabold text-[.8rem] text-[var(--ink)] mb-0.5">
                      <span>#{p.id} · Mesa {pad2(p.mesaId)}</span><span>{wc.emoji}</span>
                    </div>
                    <div className="text-[.74rem] font-bold opacity-75 mb-1">👤 {p.clienteNome}</div>
                    <div className="text-[.7rem] opacity-60 mb-2">{p.itens.length} itens · {timeAgoLabel(p.criadoEm, now)}</div>
                    <CategorizedItems itens={p.itens} />
                    <button
                      onClick={() => advanceStatus(p.id)}
                      className="w-full mt-2 py-2 rounded-[10px] font-bold text-[.78rem] bg-[var(--ink)] text-[var(--card)] dark:bg-[var(--accent)] dark:text-[#161F4C]"
                    >
                      {col.action}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
