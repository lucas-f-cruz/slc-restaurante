import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { createApi } from '../lib/api';
import { pad2 } from '../lib/format';

export function StatsPage() {
  const { token } = useAuth();
  const api = createApi(token);
  const [byHour, setByHour] = useState<Record<number, number>>({});
  const [topProdutos, setTopProdutos] = useState<{ nome: string; quantidade: number }[]>([]);
  const [topMesas, setTopMesas] = useState<{ mesaId: number; quantidade: number }[]>([]);

  useEffect(() => {
    api.getPedidosPorHora().then(setByHour);
    api.getProdutosMaisVendidos().then(setTopProdutos);
    api.getMesasMaisUsadas().then(setTopMesas);
  }, [token]);

  const hours = Array.from({ length: 13 }, (_, i) => i + 11); // 11h–23h
  const maxHour = Math.max(1, ...Object.values(byHour));
  const maxProd = Math.max(1, ...topProdutos.map(p => p.quantidade));
  const maxMesa = Math.max(1, ...topMesas.map(m => m.quantidade));
  const medals = ['🥇', '🥈', '🥉', '4º', '5º'];

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-2xl text-[var(--ink)]">Estatísticas</h2>
        <p className="text-[.82rem] opacity-60 mt-1">Visão geral de desempenho do dia</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-4">
        <Card title="Pedidos por hora">
          <div className="flex items-end gap-1.5 h-[140px]">
            {hours.map(h => (
              <div key={h} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                <div className="w-full rounded-t-md bg-[var(--accent)] min-h-[3px]" style={{ height: `${((byHour[h] ?? 0) / maxHour * 100) || 2}%` }} />
                <div className="text-[.6rem] opacity-55">{h}h</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Produtos mais vendidos">
          {topProdutos.length === 0 ? <p className="text-[.82rem] opacity-50">Sem dados ainda.</p> : topProdutos.map((p, i) => (
            <RankRow key={p.nome} medal={medals[i]} name={p.nome} value={`${p.quantidade} un.`} pct={p.quantidade / maxProd * 100} />
          ))}
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Mesas mais utilizadas">
          {topMesas.length === 0 ? <p className="text-[.82rem] opacity-50">Sem dados ainda.</p> : topMesas.map((m, i) => (
            <RankRow key={m.mesaId} medal={medals[i]} name={`Mesa ${pad2(m.mesaId)}`} value={`${m.quantidade} pedidos`} pct={m.quantidade / maxMesa * 100} />
          ))}
        </Card>
        <Card title="Sobre estas estatísticas">
          <p className="text-[.82rem] opacity-70 leading-relaxed">
            Calculadas em tempo real a partir dos pedidos registrados no banco de dados —
            não são dados simulados. Categorias mais vendidas podem ser cruzadas na tela de Cardápio.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] p-5">
      <h3 className="text-[.95rem] font-bold text-[var(--ink)] mb-4">{title}</h3>
      {children}
    </div>
  );
}
function RankRow({ medal, name, value, pct }: { medal: string; name: string; value: string; pct: number }) {
  return (
    <div className="mb-2.5">
      <div className="flex items-center gap-2.5">
        <span className="w-6 text-center">{medal}</span>
        <span className="flex-1 text-[.82rem] font-semibold">{name}</span>
        <span className="text-[.78rem] font-extrabold opacity-70">{value}</span>
      </div>
      <div className="h-1.5 rounded bg-[var(--bg-2)] overflow-hidden mt-1">
        <div className="h-full rounded bg-[var(--accent)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
