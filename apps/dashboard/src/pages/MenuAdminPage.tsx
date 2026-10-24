import { useEffect, useMemo, useState } from 'react';
import { Search, X, LayoutGrid } from 'lucide-react';
import { CATEGORIA_META, type CategoriaChave } from '@sol-e-lua/shared';
import { useAuth } from '../lib/AuthContext';
import { createApi, type ProdutoAdmin } from '../lib/api';
import { usePermission } from '../components/DashboardLayout';
import { CategoryButton } from '../components/CategoryButton';
import { CATEGORY_ICON } from '../lib/categoryIcons';
import { money } from '../lib/format';
import { Modal, Field } from './TablesPage';

// Nota: os produtos não trazem a categoria de produção diretamente do endpoint /produtos
// (ela vive na seção do cardápio). Buscamos via /menu para ter essa info e cruzamos pelo id.
export function MenuAdminPage() {
  const { token } = useAuth();
  const api = createApi(token);
  const can = usePermission();
  const [tab, setTab] = useState<'produtos' | 'disponibilidade'>('produtos');
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);
  const [categoriaPorProduto, setCategoriaPorProduto] = useState<Record<string, CategoriaChave>>({});
  const [filter, setFilter] = useState<'todos' | CategoriaChave>('todos');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ProdutoAdmin | null>(null);

  async function load() {
    const [prodList, menu] = await Promise.all([
      api.getProdutosAdmin(),
      fetch('/api/v1/menu').then(r => r.json()) as Promise<{ categoriaChave: CategoriaChave; produtos: { id: string }[] }[]>
    ]);
    setProdutos(prodList);
    const map: Record<string, CategoriaChave> = {};
    menu.forEach(sec => sec.produtos.forEach(p => { map[p.id] = sec.categoriaChave; }));
    setCategoriaPorProduto(map);
  }
  useEffect(() => { load(); }, [token]);

  async function toggle(id: string, disponivel: boolean) {
    await api.toggleDisponibilidade(id, disponivel);
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, disponivel } : p));
  }
  async function saveEdit() {
    if (!editing) return;
    await api.updateProduto(editing.id, { nome: editing.nome, preco: editing.preco, descricao: editing.descricao, disponivel: editing.disponivel });
    setProdutos(prev => prev.map(p => p.id === editing.id ? editing : p));
    setEditing(null);
  }

  const filtrados = useMemo(() => {
    let list = filter === 'todos' ? produtos : produtos.filter(p => categoriaPorProduto[p.id] === filter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(p => p.nome.toLowerCase().includes(q));
    return list;
  }, [produtos, categoriaPorProduto, filter, search]);

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-2xl text-[var(--ink)]">Cardápio</h2>
        <p className="text-[.82rem] opacity-60 mt-1">Produtos e disponibilidade — sincronizado automaticamente com o cardápio do cliente</p>
      </div>
      <div className="flex gap-2 mb-5">
        <CategoryButton icon={LayoutGrid} label="Produtos" active={tab === 'produtos'} accent="#5C2A1E" onClick={() => setTab('produtos')} size="sm" />
        <CategoryButton icon={LayoutGrid} label="Disponibilidade" active={tab === 'disponibilidade'} accent="#5C2A1E" onClick={() => setTab('disponibilidade')} size="sm" />
      </div>

      {tab === 'produtos' ? (
        <>
          <div className="relative mb-4 max-w-md">
            <Search size={17} strokeWidth={2.25} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar prato, bebida ou produto..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-[var(--line)] bg-[var(--card)] text-[.85rem] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                <X size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5 mb-5">
            <CategoryButton icon={LayoutGrid} label="Todos" active={filter === 'todos'} accent="#5C2A1E" onClick={() => setFilter('todos')} size="sm" />
            {Object.entries(CATEGORIA_META).map(([key, meta]) => (
              <CategoryButton
                key={key} icon={CATEGORY_ICON[key as CategoriaChave]} label={meta.label}
                active={filter === key} accent={meta.hex} onClick={() => setFilter(key as CategoriaChave)} size="sm"
              />
            ))}
          </div>
          {filtrados.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] text-center py-14 opacity-55">
              <p className="text-sm m-0">Não encontramos nenhum produto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filtrados.map(p => {
                const catKey = categoriaPorProduto[p.id] ?? 'petiscos';
                const cat = CATEGORIA_META[catKey];
                const Icon = CATEGORY_ICON[catKey];
                return (
                  <div key={p.id} className={`bg-[var(--card)] border border-[var(--line)] rounded-[20px] p-4 flex flex-col gap-2 shadow-sm transition-opacity ${p.disponivel ? '' : 'opacity-55'}`}>
                    <span className="inline-flex items-center gap-1.5 text-[.68rem] font-bold text-white px-2 py-0.5 rounded-lg w-fit" style={{ background: cat.hex }}>
                      <Icon size={11} strokeWidth={2.5} /> {cat.label}
                    </span>
                    <div className="font-bold text-[.92rem]">{p.nome}</div>
                    <div className="text-[.76rem] opacity-65 leading-snug">{p.descricao}</div>
                    <div className="font-extrabold text-[var(--accent)]">{money(p.preco)}</div>
                    <label className="flex items-center gap-2 text-[.74rem] font-bold pt-1.5 border-t border-[var(--line)] cursor-pointer">
                      <Switch on={p.disponivel} onClick={() => toggle(p.id, !p.disponivel)} disabled={!can('toggleAvailability')} />
                      {p.disponivel ? 'Disponível' : 'Indisponível'}
                    </label>
                    {can('changePrices') && (
                      <button onClick={() => setEditing(p)} className="px-3 py-1.5 rounded-[10px] border border-[var(--line)] text-[.74rem] font-bold w-fit hover:bg-[var(--bg-2)] transition-colors">Editar</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        Object.entries(CATEGORIA_META).map(([key, meta]) => {
          const Icon = CATEGORY_ICON[key as CategoriaChave];
          const items = produtos.filter(p => categoriaPorProduto[p.id] === key);
          if (items.length === 0) return null;
          return (
            <div key={key} className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] py-4 mb-5 shadow-sm">
              <div className="px-4 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[.68rem] font-bold text-white px-2 py-0.5 rounded-lg" style={{ background: meta.hex }}>
                  <Icon size={11} strokeWidth={2.5} /> {meta.label}
                </span>
              </div>
              {items.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)] last:border-0">
                  <div className="text-[.85rem] font-semibold">{p.nome}</div>
                  <div className="flex items-center gap-1.5 text-[.72rem] font-bold cursor-pointer" onClick={() => toggle(p.id, !p.disponivel)}>
                    <span style={{ color: p.disponivel ? 'var(--st-pronto)' : 'var(--st-recusado)' }}>{p.disponivel ? '● Disponível' : '● Indisponível'}</span>
                    <Switch on={p.disponivel} onClick={() => toggle(p.id, !p.disponivel)} disabled={!can('toggleAvailability')} />
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h2 className="font-display text-xl text-[var(--ink)] mb-4">Editar produto</h2>
          <Field label="Nome" value={editing.nome} onChange={v => setEditing({ ...editing, nome: v })} placeholder="" />
          <Field label="Preço (R$)" value={String(editing.preco)} onChange={v => setEditing({ ...editing, preco: Number(v) || 0 })} placeholder="" />
          <Field label="Descrição" value={editing.descricao ?? ''} onChange={v => setEditing({ ...editing, descricao: v })} placeholder="" />
          <div className="flex gap-2.5 mt-4">
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-[10px] border border-[var(--line)] font-bold text-[.82rem]">Cancelar</button>
            <button onClick={saveEdit} className="px-4 py-2 rounded-[10px] font-bold text-[.82rem] bg-[var(--ink)] text-[var(--card)]">Salvar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Switch({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); if (!disabled) onClick(); }}
      className={`w-8.5 h-[19px] rounded-full relative transition-colors flex-shrink-0 ${disabled ? 'opacity-40' : 'cursor-pointer'}`}
      style={{ background: on ? 'var(--st-pronto)' : 'var(--line)' }}
    >
      <div className="absolute top-0.5 w-[15px] h-[15px] rounded-full bg-white transition-transform" style={{ transform: on ? 'translateX(15px)' : 'translateX(2px)' }} />
    </div>
  );
}
