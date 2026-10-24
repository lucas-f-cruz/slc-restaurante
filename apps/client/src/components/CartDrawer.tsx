import { useSession } from '../lib/SessionContext';
import type { SecaoComProdutos } from '../lib/api';

type Produto = SecaoComProdutos['produtos'][number];

export function CartDrawer({ open, onClose, allProducts, onSubmit, submitting, restaurantOpen }: {
  open: boolean; onClose: () => void; allProducts: Map<string, { produto: Produto; accent: string }>;
  onSubmit: () => void; submitting: boolean; restaurantOpen: boolean;
}) {
  const { cartLines, addToCart } = useSession();
  const total = cartLines.reduce((s, l) => {
    const p = allProducts.get(l.produtoId);
    return s + (p ? p.produto.preco * l.quantidade : 0);
  }, 0);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 max-w-[640px] mx-auto bg-[var(--bg)] text-[var(--text)] rounded-t-[20px] p-6 max-h-[86vh] overflow-y-auto
          transition-transform duration-400 ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-xl text-[var(--ink)]">Seu pedido</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bg-2)]">✕</button>
        </div>

        {cartLines.length === 0 ? (
          <div className="text-center py-8 opacity-60">
            <div className="text-3xl mb-2">🍽️</div>
            <p className="text-sm">Seu pedido está vazio.</p>
          </div>
        ) : (
          cartLines.map(l => {
            const entry = allProducts.get(l.produtoId);
            if (!entry) return null;
            return (
              <div key={l.produtoId} className="flex justify-between items-center py-2.5 border-b border-[var(--line)]">
                <div>
                  <div className="font-bold text-sm">{entry.produto.nome}</div>
                  <div className="text-xs opacity-60">R$ {entry.produto.preco.toFixed(2).replace('.', ',')} cada</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 bg-[var(--bg-2)] rounded-full px-2 py-1">
                    <button onClick={() => addToCart(l.produtoId, -1)}
                      className="w-6 h-6 rounded-full text-white font-bold text-sm" style={{ background: entry.accent }}>–</button>
                    <span className="font-bold text-sm min-w-[14px] text-center">{l.quantidade}</span>
                    <button onClick={() => addToCart(l.produtoId, 1)}
                      className="w-6 h-6 rounded-full text-white font-bold text-sm" style={{ background: entry.accent }}>+</button>
                  </div>
                  <strong>R$ {(entry.produto.preco * l.quantidade).toFixed(2).replace('.', ',')}</strong>
                </div>
              </div>
            );
          })
        )}

        <div className="flex justify-between font-extrabold text-lg my-4 text-[var(--ink)]">
          <span>Total</span><span>R$ {total.toFixed(2).replace('.', ',')}</span>
        </div>
        {!restaurantOpen && (
          <div className="text-[.76rem] text-center font-bold text-[var(--st-recusado,#C1502E)] mb-2.5">
            Estamos fechados para novos pedidos no momento.
          </div>
        )}
        <button
          onClick={onSubmit}
          disabled={cartLines.length === 0 || submitting || !restaurantOpen}
          className="w-full py-3.5 rounded-xl font-extrabold text-[.95rem] disabled:opacity-40 bg-[var(--ink)] text-[var(--card)] dark:bg-[var(--accent)] dark:text-[#161F4C]"
        >
          {submitting ? 'Enviando...' : 'Enviar pedido para a cozinha'}
        </button>
      </div>
    </>
  );
}
