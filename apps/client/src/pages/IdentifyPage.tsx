import { useState } from 'react';
import type { Configuracoes } from '@sol-e-lua/shared';
import { api } from '../lib/api';

export function IdentifyPage({
  mesaFromQr, config, onIdentified
}: {
  mesaFromQr: number | null;
  config: Configuracoes;
  onIdentified: (mesaId: number, nome: string) => void;
}) {
  const [tab, setTab] = useState<'qr' | 'manual'>(config.tableIdMethod === 'manual' ? 'manual' : 'qr');
  const [nome, setNome] = useState('');
  const [numeroMesa, setNumeroMesa] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function continuarComMesa(mesaId: number) {
    if (!nome.trim()) { setErro('Informe seu nome para continuar.'); return; }
    setChecking(true);
    try {
      await api.getMesa(mesaId); // valida que a mesa existe de verdade no backend
      onIdentified(mesaId, nome.trim());
    } catch {
      setErro('Mesa não encontrada. Confira o número e tente novamente.');
    } finally {
      setChecking(false);
    }
  }

  if (mesaFromQr) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-[440px] w-full p-9 bg-[var(--card)] border border-[var(--line)] rounded-[20px]">
          <h1 className="font-display text-2xl text-[var(--ink)] mb-1">Identifique-se</h1>
          <div className="text-sm opacity-60 mb-6">Mesa identificada automaticamente pelo QR Code</div>
          <div className="text-center p-4 bg-[var(--bg-2)] rounded-xl mb-4 text-sm opacity-75">
            📍 Mesa identificada: <strong>{String(mesaFromQr).padStart(2, '0')}</strong>
          </div>
          <Field label="Seu nome" value={nome} onChange={setNome} placeholder="Digite seu nome" />
          {erro && <p className="text-[var(--st-recusado,#C1502E)] text-sm font-bold -mt-2 mb-2">{erro}</p>}
          <button
            onClick={() => continuarComMesa(mesaFromQr)}
            disabled={checking}
            className="w-full py-3 rounded-[10px] font-bold text-[.9rem] bg-[var(--ink)] text-[var(--card)] disabled:opacity-50"
          >
            {checking ? 'Verificando...' : 'Entrar no cardápio'}
          </button>
        </div>
      </div>
    );
  }

  const showTabs = config.tableIdMethod === 'both';
  const activeTab = showTabs ? tab : config.tableIdMethod;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-[440px] w-full p-9 bg-[var(--card)] border border-[var(--line)] rounded-[20px]">
        <h1 className="font-display text-2xl text-[var(--ink)] mb-1">Identifique sua mesa</h1>
        <div className="text-sm opacity-60 mb-6">Precisamos saber onde você está sentado</div>

        {showTabs && (
          <div className="flex gap-2 mb-6">
            <TabBtn active={tab === 'qr'} onClick={() => setTab('qr')}>Escanear QR Code</TabBtn>
            <TabBtn active={tab === 'manual'} onClick={() => setTab('manual')}>Digitar mesa</TabBtn>
          </div>
        )}

        {activeTab === 'qr' ? (
          <>
            <div className="text-center p-4 bg-[var(--bg-2)] rounded-xl mb-4 text-[.78rem] opacity-75 leading-relaxed">
              📷 Normalmente você escanearia o QR Code fixado na mesa.<br />Para simular, escolha a mesa abaixo:
            </div>
            <Field label="Simular leitura — Mesa" value={numeroMesa} onChange={setNumeroMesa} placeholder="Ex: 7" />
            <Field label="Seu nome" value={nome} onChange={setNome} placeholder="Digite seu nome" />
            {erro && <p className="text-[var(--st-recusado,#C1502E)] text-sm font-bold -mt-2 mb-2">{erro}</p>}
            <button
              onClick={() => {
                const n = Number(numeroMesa);
                if (!n) { setErro('Informe um número de mesa válido.'); return; }
                continuarComMesa(n);
              }}
              disabled={checking}
              className="w-full py-3 rounded-[10px] font-bold text-[.9rem] bg-[var(--ink)] text-[var(--card)] disabled:opacity-50"
            >
              {checking ? 'Verificando...' : 'Entrar no cardápio'}
            </button>
          </>
        ) : (
          <>
            <Field label="Número da mesa" value={numeroMesa} onChange={setNumeroMesa} placeholder="Digite o número da mesa" />
            <Field label="Seu nome" value={nome} onChange={setNome} placeholder="Digite seu nome" />
            {erro && <p className="text-[var(--st-recusado,#C1502E)] text-sm font-bold -mt-2 mb-2">{erro}</p>}
            <button
              onClick={() => {
                const n = Number(numeroMesa);
                if (!n) { setErro('Número de mesa inválido.'); return; }
                continuarComMesa(n);
              }}
              disabled={checking}
              className="w-full py-3 rounded-[10px] font-bold text-[.9rem] bg-[var(--ink)] text-[var(--card)] disabled:opacity-50"
            >
              {checking ? 'Verificando...' : 'Continuar'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="mb-3.5 text-left">
      <label className="block text-[.72rem] font-bold opacity-65 mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-[9px] border border-[var(--line)] bg-[var(--bg-2)] text-[var(--text)] text-[.85rem]"
      />
    </div>
  );
}
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-[10px] border text-[.8rem] font-bold ${active ? 'bg-[var(--ink)] text-[var(--card)] border-[var(--ink)]' : 'border-[var(--line)] text-[var(--text)]'}`}
    >
      {children}
    </button>
  );
}
