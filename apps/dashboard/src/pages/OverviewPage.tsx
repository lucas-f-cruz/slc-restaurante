import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { createApi } from '../lib/api';
import { useLiveData } from '../lib/LiveDataContext';
import { OrderCard } from '../components/OrderCard';
import { useClock } from '../lib/useClock';
import { money, pad2 } from '../lib/format';

export function OverviewPage({ onOpenDetail }: { onOpenDetail: (id: number) => void }) {
  const { token } = useAuth();
  const api = createApi(token);
  const { pedidos, mesas, advanceStatus } = useLiveData();
  const now = useClock();
  const [resumo, setResumo] = useState<{ total: number; pendentes: number; preparo: number; faturamento: number } | null>(null);

  useEffect(() => { api.getResumo().then(setResumo); }, [pedidos.length]);

  const ativos = pedidos.filter(p => p.status !== 'finalizado').sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime());
  const ocupadas = mesas.filter(m => m.status !== 'livre').length;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 mb-7">
        <SummaryCard icon="🧾" value={String(resumo?.total ?? pedidos.length)} label="Pedidos hoje" sub="+12% em relação a ontem" up />
        <SummaryCard icon="⏳" value={pad2(resumo?.pendentes ?? 0)} label="Pedidos pendentes" sub="Aguardando início do preparo" />
        <SummaryCard icon="🔥" value={pad2(resumo?.preparo ?? 0)} label="Em preparo" sub="Pedidos atualmente na cozinha" />
        <SummaryCard icon="🍽️" value={`${ocupadas} / ${mesas.length}`} label="Mesas ocupadas" sub={`${ocupadas} mesas ocupadas de ${mesas.length}`} />
        <SummaryCard icon="💰" value={money(resumo?.faturamento ?? 0)} label="Faturamento" sub="Valor acumulado no dia" big />
      </div>

      <div className="flex items-end justify-between gap-4 mb-3.5 flex-wrap">
        <h2 className="font-display text-2xl text-[var(--ink)]">Pedidos em andamento</h2>
        <p className="text-[.82rem] opacity-60">{ativos.length} pedidos ativos, mais antigo primeiro</p>
      </div>

      {ativos.length === 0 ? (
        <EmptyState icon="🌙" text="Nenhum pedido em andamento no momento." />
      ) : (
        <div className="flex flex-col gap-3">
          {ativos.map(p => <OrderCard key={p.id} pedido={p} now={now} onAdvance={advanceStatus} onOpenDetail={onOpenDetail} />)}
        </div>
      )}
    </div>
  );
}

export function SummaryCard({ icon, value, label, sub, up, big }: { icon: string; value: string; label: string; sub: string; up?: boolean; big?: boolean }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] p-4.5 flex flex-col gap-1.5">
      <div className="text-[1.1rem] opacity-70">{icon}</div>
      <div className={`font-display font-bold text-[var(--ink)] ${big ? 'text-[1.35rem]' : 'text-[1.7rem]'}`}>{value}</div>
      <div className="text-[.76rem] font-bold opacity-70">{label}</div>
      <div className={`text-[.7rem] ${up ? 'text-[var(--st-pronto)] font-bold opacity-100' : 'opacity-55'}`}>{sub}</div>
    </div>
  );
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] text-center py-16 px-5 opacity-55">
      <div className="text-4xl mb-2.5">{icon}</div>
      <p className="text-sm m-0">{text}</p>
    </div>
  );
}
