import { useSession } from '../lib/SessionContext';
import type { SecaoComProdutos } from '../lib/api';

type Produto = SecaoComProdutos['produtos'][number];

export function ItemCard({ produto, accent, restaurantOpen, onOpenDetail }: {
  produto: Produto; accent: string; restaurantOpen: boolean; onOpenDetail: (id: string) => void;
}) {
  const { cart, addToCart } = useSession();
  const qty = cart[produto.id] ?? 0;
  const podeEncomendar = produto.disponivel && restaurantOpen;

  return (
    <div
      onClick={() => podeEncomendar && onOpenDetail(produto.id)}
      className={`bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-4 flex flex-col gap-1.5 transition-all duration-200
        ${podeEncomendar
          ? 'cursor-pointer hover:-translate-y-1 active:scale-[.97]'
          : 'cursor-not-allowed opacity-50 grayscale-[.6]'}`}
      style={{ borderLeft: `3px solid ${podeEncomendar ? accent : 'var(--line)'}` }}
    >
      <div className="flex justify-between items-baseline gap-2.5">
        <div className="font-bold text-[.95rem] text-[var(--ink)]">{produto.nome}</div>
        <div className="font-extrabold text-[.92rem] whitespace-nowrap" style={{ color: accent }}>
          R$ {produto.preco.toFixed(2).replace('.', ',')}
        </div>
      </div>
      {produto.descricao && <div className="text-[.78rem] opacity-75 leading-snug">{produto.descricao}</div>}

      {!restaurantOpen ? (
        <div className="text-[.72rem] font-extrabold uppercase tracking-wide text-[var(--st-recusado,#C1502E)]">
          Restaurante fechado no momento
        </div>
      ) : produto.disponivel ? (
        <div className="flex items-center justify-between mt-1" onClick={e => e.stopPropagation()}>
          {qty > 0 ? (
            <div className="flex items-center gap-2.5 bg-[var(--bg-2)] rounded-full px-2 py-1">
              <button onClick={() => addToCart(produto.id, -1)}
                className="w-6 h-6 rounded-full text-white font-bold text-[.9rem]" style={{ background: accent }}>–</button>
              <span className="font-bold text-[.85rem] min-w-[14px] text-center">{qty}</span>
              <button onClick={() => addToCart(produto.id, 1)}
                className="w-6 h-6 rounded-full text-white font-bold text-[.9rem]" style={{ background: accent }}>+</button>
            </div>
          ) : (
            <button onClick={() => addToCart(produto.id, 1)}
              className="rounded-full text-white text-[.78rem] font-bold px-3.5 py-1.5" style={{ background: accent }}>
              Adicionar
            </button>
          )}
        </div>
      ) : (
        <div className="text-[.72rem] font-extrabold uppercase tracking-wide text-[var(--st-recusado,#C1502E)]">
          Indisponível no momento
        </div>
      )}
    </div>
  );
}
