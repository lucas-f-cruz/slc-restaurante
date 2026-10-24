import { useState } from 'react';
import { STATUS_LABEL, type StatusPedido } from '@sol-e-lua/shared';
import { useLiveData } from '../lib/LiveDataContext';
import { fmtTimeShort, money, pad2 } from '../lib/format';

export function HistoryPage({ onOpenDetail }: { onOpenDetail: (id: number) => void }) {
  const { pedidos } = useLiveData();
  const [period, setPeriod] = useState<'hoje' | '7dias' | '30dias' | 'todos'>('hoje');
  const [mesa, setMesa] = useState('');
  const [pedidoBusca, setPedidoBusca] = useState('');
  const [status, setStatus] = useState<'todos' | StatusPedido>('todos');

  const now = new Date();
  let filtrados = [...pedidos].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  if (period === 'hoje') filtrados = filtrados.filter(p => new Date(p.criadoEm).toDateString() === now.toDateString());
  else if (period === '7dias') filtrados = filtrados.filter(p => now.getTime() - new Date(p.criadoEm).getTime() <= 7 * 24 * 3600000);
  else if (period === '30dias') filtrados = filtrados.filter(p => now.getTime() - new Date(p.criadoEm).getTime() <= 30 * 24 * 3600000);
  if (mesa) filtrados = filtrados.filter(p => String(p.mesaId).includes(mesa));
  if (pedidoBusca) filtrados = filtrados.filter(p => String(p.id).includes(pedidoBusca));
  if (status !== 'todos') filtrados = filtrados.filter(p => p.status === status);

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-2xl text-[var(--ink)]">Histórico de pedidos</h2>
        <p className="text-[.82rem] opacity-60 mt-1">{filtrados.length} pedidos encontrados</p>
      </div>
      <div className="flex flex-wrap gap-2 items-center mb-4.5">
        {([['hoje', 'Hoje'], ['7dias', 'Últimos 7 dias'], ['30dias', 'Últimos 30 dias'], ['todos', 'Todo o período']] as const).map(([k, l]) => (
          <Chip key={k} active={period === k} onClick={() => setPeriod(k)}>{l}</Chip>
        ))}
        <input value={mesa} onChange={e => setMesa(e.target.value)} placeholder="Nº da mesa"
          className="px-3.5 py-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] text-[.8rem] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]" />
        <input value={pedidoBusca} onChange={e => setPedidoBusca(e.target.value)} placeholder="Nº do pedido"
          className="px-3.5 py-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] text-[.8rem] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]" />
        <select value={status} onChange={e => setStatus(e.target.value as any)}
          className="px-3.5 py-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] text-[.8rem] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]">
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] overflow-x-auto shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Pedido', 'Mesa', 'Cliente', 'Horário', 'Valor', 'Status'].map(h => (
                <th key={h} className="text-left text-[.7rem] uppercase tracking-wide opacity-55 px-3.5 py-2.5 border-b border-[var(--line)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={6} className="text-center opacity-55 py-8">Nenhum pedido encontrado com esses filtros.</td></tr>
            ) : filtrados.map(p => (
              <tr key={p.id} onClick={() => onOpenDetail(p.id)} className="cursor-pointer hover:bg-[var(--bg-2)] transition-colors">
                <td className="px-3.5 py-3 text-[.82rem] border-b border-[var(--line)]">#{p.id}</td>
                <td className="px-3.5 py-3 text-[.82rem] border-b border-[var(--line)]">Mesa {pad2(p.mesaId)}</td>
                <td className="px-3.5 py-3 text-[.82rem] border-b border-[var(--line)]">{p.clienteNome}</td>
                <td className="px-3.5 py-3 text-[.82rem] border-b border-[var(--line)]">{fmtTimeShort(p.criadoEm)}</td>
                <td className="px-3.5 py-3 text-[.82rem] border-b border-[var(--line)]">{money(p.total)}</td>
                <td className="px-3.5 py-3 border-b border-[var(--line)]">
                  <span className="px-2.5 py-0.5 rounded-full text-[.68rem] font-extrabold uppercase text-white" style={{ background: statusColor(p.status) }}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusColor(s: StatusPedido) {
  return { novo: 'var(--st-novo)', preparando: 'var(--st-preparando)', pronto: 'var(--st-pronto)', entregue: 'var(--st-entregue)', finalizado: 'var(--st-finalizado)' }[s];
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3.5 py-1.5 rounded-full border text-[.76rem] font-bold
      ${active ? 'bg-[var(--ink)] text-[var(--card)] border-[var(--ink)] dark:bg-[var(--accent)] dark:text-[#161F4C]' : 'border-[var(--line)] bg-[var(--card)]'}`}>
      {children}
    </button>
  );
}
