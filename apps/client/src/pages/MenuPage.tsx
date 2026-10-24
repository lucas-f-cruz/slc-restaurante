import { useEffect, useMemo, useState } from 'react';
import { useSession } from '../lib/SessionContext';
import { api, type SecaoComProdutos } from '../lib/api';
import { CategoryTabs } from '../components/CategoryTabs';
import { ItemCard } from '../components/ItemCard';
import { CartDrawer } from '../components/CartDrawer';
import { ThemeToggle } from '../components/ThemeToggle';
import { useWebSocket } from '../lib/useWebSocket';
import type { Pedido } from '@sol-e-lua/shared';

const FILL_CAP = 6;
const FOOD_CATEGORIES = new Set(['pratos', 'petiscos', 'sobremesas']);

export function MenuPage({ restaurantOpen, onOrderSubmitted }: { restaurantOpen: boolean; onOrderSubmitted: (pedido: Pedido) => void }) {
  const { mesaId, clienteNome, cartLines, clearCart } = useSession();
  const [secoes, setSecoes] = useState<SecaoComProdutos[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { api.getMenu().then(setSecoes); }, []);

  // Disponibilidade sincronizada em tempo real com o painel administrativo
  useWebSocket(event => {
    if (event.type === 'produto:disponibilidade') {
      setSecoes(prev => prev?.map(s => ({
        ...s,
        produtos: s.produtos.map(p => p.id === event.payload.produtoId ? { ...p, disponivel: event.payload.disponivel } : p)
      })) ?? prev);
    }
  });

  const allProducts = useMemo(() => {
    const map = new Map<string, { produto: SecaoComProdutos['produtos'][number]; accent: string; categoria: string }>();
    secoes?.forEach(s => s.produtos.forEach(p => map.set(p.id, { produto: p, accent: s.corHex ?? '#E29A3C', categoria: s.categoriaChave })));
    return map;
  }, [secoes]);

  const foodCount = cartLines.reduce((s, l) => FOOD_CATEGORIES.has(allProducts.get(l.produtoId)?.categoria ?? '') ? s + l.quantidade : s, 0);
  const drinkCount = cartLines.reduce((s, l) => !FOOD_CATEGORIES.has(allProducts.get(l.produtoId)?.categoria ?? '') ? s + l.quantidade : s, 0);
  const platePct = Math.min(foodCount / FILL_CAP, 1);
  const cupPct = Math.min(drinkCount / FILL_CAP, 1);

  const total = cartLines.reduce((s, l) => s + (allProducts.get(l.produtoId)?.produto.preco ?? 0) * l.quantidade, 0);
  const count = cartLines.reduce((s, l) => s + l.quantidade, 0);

  async function handleSubmit() {
    if (!mesaId || cartLines.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const pedido = await api.criarPedido({
        mesaId, clienteNome, itens: cartLines.map(l => ({ produtoId: l.produtoId, quantidade: l.quantidade }))
      });
      clearCart();
      setDrawerOpen(false);
      onOrderSubmitted(pedido);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!secoes) return <div className="min-h-screen flex items-center justify-center opacity-60">Carregando cardápio...</div>;

  const sec = secoes[activeIndex];
  const detailEntry = detailId ? allProducts.get(detailId) : null;

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-20 bg-[var(--bg)] border-b border-[var(--line)] px-5 pt-4 pb-3.5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center max-w-[900px] mx-auto">
          <div className="justify-self-start">
            <div className="font-display font-bold text-lg text-[var(--ink)]">☀︎ Sol <em className="font-medium opacity-70">e</em> Lua <em className="font-medium opacity-70">Café</em></div>
            <div className="text-[.66rem] opacity-55 mt-0.5">Mesa {String(mesaId).padStart(2, '0')} · {clienteNome}</div>
          </div>
          <div className="justify-self-center flex gap-4">
            <FillIcon kind="plate" pct={platePct} onClick={() => setDrawerOpen(true)} />
            <FillIcon kind="cup" pct={cupPct} onClick={() => setDrawerOpen(true)} />
          </div>
          <div className="justify-self-end"><ThemeToggle /></div>
        </div>
        <CategoryTabs secoes={secoes} activeIndex={activeIndex} onSelect={setActiveIndex} />
      </header>

      <main className="max-w-[900px] mx-auto px-5 pt-6">
        {!restaurantOpen && (
          <div className="mb-5 rounded-2xl border border-[var(--st-recusado,#C1502E)]/30 bg-[var(--st-recusado,#C1502E)]/10 px-4 py-3 text-center">
            <div className="font-extrabold text-[var(--st-recusado,#C1502E)] text-[.88rem]">Restaurante fechado no momento.</div>
            <div className="text-[.76rem] opacity-70 mt-0.5">Estamos fechados para novos pedidos. Você ainda pode consultar o cardápio.</div>
          </div>
        )}
        <div key={sec.id} className="animate-[sectionIn_.35s_ease]">
          <h2 className="font-display font-semibold text-2xl mb-1 flex items-center gap-2.5" style={{ color: sec.corHex ?? 'var(--ink)' }}>
            <span>{sec.icone}</span>{sec.titulo}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
            {sec.produtos.map(p => (
              <ItemCard key={p.id} produto={p} accent={sec.corHex ?? '#E29A3C'} restaurantOpen={restaurantOpen} onOpenDetail={setDetailId} />
            ))}
          </div>
        </div>
      </main>

      <div className="fixed left-0 right-0 bottom-0 z-30 flex justify-center p-3.5 pointer-events-none">
        <div
          onClick={() => setDrawerOpen(true)}
          className={`pointer-events-auto max-w-[860px] w-full mx-4 bg-[var(--ink)] text-[var(--card)] dark:bg-[var(--accent)] dark:text-[#161F4C] rounded-2xl px-4.5 py-3.5
            flex items-center justify-between cursor-pointer shadow-lg transition-transform duration-400
            ${count > 0 ? 'translate-y-0' : 'translate-y-[140%]'}`}
        >
          <div className="flex items-center font-bold text-sm">
            <span className="bg-white/20 rounded-full w-6.5 h-6.5 flex items-center justify-center text-[.8rem] mr-2.5">{count}</span>
            ver pedido
          </div>
          <div className="font-extrabold">R$ {total.toFixed(2).replace('.', ',')}</div>
        </div>
      </div>

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        allProducts={allProducts}
        onSubmit={handleSubmit}
        submitting={submitting}
        restaurantOpen={restaurantOpen}
      />
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-[var(--st-recusado,#C1502E)] text-white px-5 py-3 rounded-xl text-sm font-bold z-[60]">
          {error}
        </div>
      )}

      {detailEntry && (
        <ItemDetailModal
          entry={detailEntry}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

function FillIcon({ kind, pct, onClick }: { kind: 'plate' | 'cup'; pct: number; onClick: () => void }) {
  const h = 44 * pct;
  return (
    <div onClick={onClick} className="w-9 h-9 relative cursor-pointer" title={kind === 'plate' ? 'Comidas no pedido' : 'Cafés e bebidas no pedido'}>
      <svg viewBox="0 0 44 44" className="w-full h-full overflow-visible block">
        {kind === 'plate' ? (
          <>
            <clipPath id={`clip-${kind}`}><circle cx="22" cy="22" r="19" /></clipPath>
            <g clipPath={`url(#clip-${kind})`}>
              <rect x="0" y={44 - h} width="44" height={h} fill="var(--sol-accent)" style={{ transition: 'y .5s, height .5s' }} />
            </g>
            <circle cx="22" cy="22" r="20" fill="none" stroke="var(--sol-line)" strokeWidth="2" className="dark:stroke-[rgba(244,239,227,.55)]" />
            <circle cx="22" cy="22" r="12" fill="none" stroke="var(--sol-line)" strokeWidth="1" className="dark:stroke-[rgba(244,239,227,.55)]" />
          </>
        ) : (
          <>
            <clipPath id={`clip-${kind}`}><path d="M11,9 L33,9 L30,33 Q22,38 14,33 Z" /></clipPath>
            <g clipPath={`url(#clip-${kind})`}>
              <rect x="0" y={44 - h} width="44" height={h} fill="#8B5A2B" style={{ transition: 'y .5s, height .5s' }} />
            </g>
            <path d="M11,9 L33,9 L30,33 Q22,38 14,33 Z" fill="none" stroke="var(--sol-line)" strokeWidth="2" />
            <path d="M32,13 Q40,13 39,20 Q38,26 31,25" fill="none" stroke="var(--sol-line)" strokeWidth="2" />
          </>
        )}
      </svg>
      <div className="absolute -bottom-3.5 left-0 right-0 text-center text-[.55rem] font-bold opacity-50">
        {kind === 'plate' ? 'prato' : 'café'}
      </div>
    </div>
  );
}

function ItemDetailModal({ entry, onClose }: {
  entry: { produto: SecaoComProdutos['produtos'][number]; accent: string }; onClose: () => void;
}) {
  const { cart, addToCart } = useSession();
  const qty = cart[entry.produto.id] ?? 0;
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed left-0 right-0 bottom-0 z-50 max-w-[640px] mx-auto bg-[var(--bg)] text-[var(--text)] rounded-t-[20px] p-6">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--bg-2)]">✕</button>
        <h2 className="font-display text-xl mb-1.5 pr-9" style={{ color: entry.accent }}>{entry.produto.nome}</h2>
        <div className="font-extrabold text-lg mb-3.5" style={{ color: entry.accent }}>R$ {entry.produto.preco.toFixed(2).replace('.', ',')}</div>
        <p className="text-sm opacity-85 mb-5">{entry.produto.descricao ?? 'Sem descrição adicional para este item.'}</p>
        {qty > 0 ? (
          <div className="flex items-center gap-3 justify-center bg-[var(--bg-2)] rounded-full px-3 py-2 w-fit mx-auto">
            <button onClick={() => addToCart(entry.produto.id, -1)} className="w-8 h-8 rounded-full text-white font-bold" style={{ background: entry.accent }}>–</button>
            <span className="font-bold">{qty}</span>
            <button onClick={() => addToCart(entry.produto.id, 1)} className="w-8 h-8 rounded-full text-white font-bold" style={{ background: entry.accent }}>+</button>
          </div>
        ) : (
          <button onClick={() => addToCart(entry.produto.id, 1)} className="w-full py-3 rounded-xl text-white font-extrabold" style={{ background: entry.accent }}>
            Adicionar ao pedido
          </button>
        )}
      </div>
    </>
  );
}
