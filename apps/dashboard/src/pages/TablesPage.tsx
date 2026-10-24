import { useState } from 'react';
import type { MesaComStatus } from '@sol-e-lua/shared';
import { useAuth } from '../lib/AuthContext';
import { createApi } from '../lib/api';
import { useLiveData } from '../lib/LiveDataContext';
import { usePermission } from '../components/DashboardLayout';
import { money, pad2 } from '../lib/format';

const STATUS_META: Record<MesaComStatus['status'], { label: string; color: string }> = {
  livre: { label: 'Livre', color: 'var(--tb-livre)' },
  aguardando: { label: 'Aguardando pedido', color: 'var(--tb-aguardando)' },
  andamento: { label: 'Pedido em andamento', color: 'var(--tb-andamento)' },
  pronto: { label: 'Pedido pronto', color: 'var(--tb-pronto)' },
  ocupada: { label: 'Ocupada', color: 'var(--tb-ocupada)' }
};

export function TablesPage({ onOpenOrder }: { onOpenOrder: (id: number) => void }) {
  const { token } = useAuth();
  const api = createApi(token);
  const can = usePermission();
  const { mesas, pedidos, refreshMesas } = useLiveData();
  const [selected, setSelected] = useState<MesaComStatus | null>(null);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    await api.createMesa(newLabel || `Mesa ${pad2(mesas.length + 1)}`);
    await refreshMesas();
    setAdding(false); setNewLabel('');
  }
  async function handleDelete(id: number) {
    try {
      await api.deleteMesa(id);
      await refreshMesas();
      setSelected(null); setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }
  async function handleFechar(id: number) { await api.fecharMesa(id); await refreshMesas(); setSelected(null); }
  async function handleLiberar(id: number) { await api.liberarMesa(id); await refreshMesas(); setSelected(null); }
  async function handleEditSave(id: number) { await api.updateMesa(id, editLabel); await refreshMesas(); setEditing(false); setSelected(null); }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-2xl text-[var(--ink)]">Mesas</h2>
        <p className="text-[.82rem] opacity-60 mt-1">{mesas.length} mesas · toque para ver detalhes</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {mesas.map(m => (
          <div key={m.id} onClick={() => setSelected(m)}
            className="relative bg-[var(--card)] border border-[var(--line)] rounded-[20px] p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 hover:-translate-y-0.5 transition-transform">
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full" style={{ background: STATUS_META[m.status].color }} />
            <div className="text-[1.6rem]">🪑</div>
            <div className="font-display font-bold text-xl text-[var(--ink)]">{m.rotulo}</div>
            <div className="text-[.68rem] font-bold" style={{ color: STATUS_META[m.status].color }}>{STATUS_META[m.status].label}</div>
          </div>
        ))}
        {can('manageTables') && (
          <div onClick={() => setAdding(true)}
            className="border-2 border-dashed border-[var(--line)] rounded-[20px] flex flex-col items-center justify-center gap-1.5 cursor-pointer opacity-60 hover:opacity-100 hover:bg-[var(--bg-2)] min-h-[98px]">
            <div className="text-[1.6rem]">➕</div>
            <div className="text-[.78rem] font-bold">Adicionar mesa</div>
          </div>
        )}
      </div>

      {adding && (
        <Modal onClose={() => setAdding(false)}>
          <h2 className="font-display text-xl text-[var(--ink)] mb-1">Adicionar mesa</h2>
          <p className="text-[.78rem] opacity-60 mb-4">Um QR Code exclusivo será gerado automaticamente</p>
          <Field label="Nome/número da mesa" value={newLabel} onChange={setNewLabel} placeholder={`Mesa ${pad2(mesas.length + 1)}`} />
          <div className="flex gap-2.5 mt-4">
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-[10px] border border-[var(--line)] font-bold text-[.82rem]">Cancelar</button>
            <button onClick={handleAdd} className="px-4 py-2 rounded-[10px] font-bold text-[.82rem] bg-[var(--ink)] text-[var(--card)]">Adicionar mesa</button>
          </div>
        </Modal>
      )}

      {selected && !editing && (
        <Modal onClose={() => { setSelected(null); setError(null); }}>
          <h2 className="font-display text-xl text-[var(--ink)] mb-1">{selected.rotulo}</h2>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[.68rem] font-extrabold uppercase text-white mb-4" style={{ background: STATUS_META[selected.status].color }}>
            {STATUS_META[selected.status].label}
          </span>
          <FieldRO label="Cliente" value={selected.clienteAtual ?? '—'} />
          {selected.pedidoAtualId && (() => {
            const pedido = pedidos.find(p => p.id === selected.pedidoAtualId);
            return pedido ? (
              <>
                <FieldRO label="Pedido atual" value={`#${pedido.id}`} />
                <FieldRO label="Valor" value={money(pedido.total)} />
              </>
            ) : null;
          })()}
          {error && <p className="text-[var(--st-recusado,#C1502E)] text-sm font-bold mb-2">{error}</p>}
          <div className="flex gap-2.5 flex-wrap mt-4">
            {selected.pedidoAtualId && (
              <button onClick={() => { onOpenOrder(selected.pedidoAtualId!); setSelected(null); }} className="px-3.5 py-2 rounded-[10px] border border-[var(--line)] font-bold text-[.8rem]">Ver pedido</button>
            )}
            {can('closeMesa') && selected.status !== 'livre' && (
              <button onClick={() => handleFechar(selected.id)} className="px-3.5 py-2 rounded-[10px] border border-[var(--line)] font-bold text-[.8rem]">Fechar mesa</button>
            )}
            {can('closeMesa') && selected.status !== 'livre' && (
              <button onClick={() => handleLiberar(selected.id)} className="px-3.5 py-2 rounded-[10px] font-bold text-[.8rem] bg-[var(--st-recusado)] text-white">Liberar mesa</button>
            )}
            {can('manageTables') && (
              <button onClick={() => { setEditLabel(selected.rotulo); setEditing(true); }} className="px-3.5 py-2 rounded-[10px] border border-[var(--line)] font-bold text-[.8rem]">Editar</button>
            )}
            {can('manageTables') && (
              <button onClick={() => handleDelete(selected.id)} className="px-3.5 py-2 rounded-[10px] font-bold text-[.8rem] bg-[var(--st-recusado)] text-white">Excluir mesa</button>
            )}
          </div>
        </Modal>
      )}

      {selected && editing && (
        <Modal onClose={() => setEditing(false)}>
          <h2 className="font-display text-xl text-[var(--ink)] mb-4">Editar mesa</h2>
          <Field label="Nome/número da mesa" value={editLabel} onChange={setEditLabel} placeholder="" />
          <div className="flex gap-2.5 mt-4">
            <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-[10px] border border-[var(--line)] font-bold text-[.82rem]">Cancelar</button>
            <button onClick={() => handleEditSave(selected.id)} className="px-4 py-2 rounded-[10px] font-bold text-[.82rem] bg-[var(--ink)] text-[var(--card)]">Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(560px,92vw)] max-h-[86vh] overflow-y-auto bg-[var(--card)] rounded-[20px] p-6.5 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--bg-2)]">✕</button>
        {children}
      </div>
    </>
  );
}
export function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="mb-3">
      <label className="block text-[.72rem] font-bold opacity-65 mb-1.5 uppercase tracking-wide">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-[9px] border border-[var(--line)] bg-[var(--bg-2)] text-[.85rem]" />
    </div>
  );
}
function FieldRO({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3">
      <label className="block text-[.72rem] font-bold opacity-65 mb-1 uppercase tracking-wide">{label}</label>
      <div className="text-[.9rem]">{value}</div>
    </div>
  );
}
