import type { Pedido } from '@sol-e-lua/shared';

export function ConfirmPage({ pedido, onNewOrder }: { pedido: Pedido; onNewOrder: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-[480px] w-full p-9 bg-[var(--card)] border border-[var(--line)] rounded-[20px] text-center">
        <div className="text-4xl mb-2">✅</div>
        <h1 className="font-display text-2xl text-[var(--ink)] mb-1">Pedido #{pedido.id} enviado!</h1>
        <div className="text-sm opacity-60 mb-4">Mesa {String(pedido.mesaId).padStart(2, '0')} · {pedido.clienteNome} · já está na cozinha</div>
        <div className="text-left my-4">
          {pedido.itens.map(it => (
            <div key={it.id} className="flex justify-between text-sm py-1.5 border-b border-[var(--line)]">
              <span>{it.quantidade}x {it.nomeProduto}</span>
              <span>R$ {(it.precoUnit * it.quantidade).toFixed(2).replace('.', ',')}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-extrabold text-lg mb-5 text-[var(--ink)]">
          <span>Total</span><span>R$ {pedido.total.toFixed(2).replace('.', ',')}</span>
        </div>
        <button onClick={onNewOrder} className="w-full py-3 rounded-[10px] font-bold bg-[var(--ink)] text-[var(--card)]">
          Fazer novo pedido
        </button>
      </div>
    </div>
  );
}
