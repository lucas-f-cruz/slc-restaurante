import { useLiveData } from '../lib/LiveDataContext';
import { useClock } from '../lib/useClock';
import { OrderCard } from '../components/OrderCard';
import { EmptyState } from './OverviewPage';

export function OrdersPage({ onOpenDetail }: { onOpenDetail: (id: number) => void }) {
  const { pedidos, advanceStatus } = useLiveData();
  const now = useClock();
  const ativos = pedidos.filter(p => p.status !== 'finalizado').sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime());

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-2xl text-[var(--ink)]">Fila de pedidos</h2>
        <p className="text-[.82rem] opacity-60 mt-1">Ordenado por horário de chegada — o mais antigo aparece primeiro</p>
      </div>
      {ativos.length === 0 ? (
        <EmptyState icon="✅" text="Nenhum pedido pendente. Tudo em dia!" />
      ) : (
        <div className="flex flex-col gap-3">
          {ativos.map(p => <OrderCard key={p.id} pedido={p} now={now} onAdvance={advanceStatus} onOpenDetail={onOpenDetail} />)}
        </div>
      )}
    </div>
  );
}
