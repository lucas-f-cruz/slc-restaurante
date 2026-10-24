import { useEffect, useState } from 'react';
import { SessionProvider, useSession } from './lib/SessionContext';
import { api } from './lib/api';
import { useWebSocket } from './lib/useWebSocket';
import { LandingPage } from './pages/LandingPage';
import { IdentifyPage } from './pages/IdentifyPage';
import { MenuPage } from './pages/MenuPage';
import { ConfirmPage } from './pages/ConfirmPage';
import iconSrc from './assets/sol-lua-icon.png';
import type { Configuracoes, Pedido } from '@sol-e-lua/shared';

type AppMode = 'landing' | 'identify' | 'menu' | 'confirm';

function AppInner() {
  const { setIdentificacao, isDark } = useSession();
  const [mode, setMode] = useState<AppMode>('landing');
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [mesaFromQr, setMesaFromQr] = useState<number | null>(null);
  const [lastOrder, setLastOrder] = useState<Pedido | null>(null);

  useEffect(() => {
    api.getConfiguracoes().then(setConfig);
    const params = new URLSearchParams(location.search);
    const mesa = params.get('mesa');
    if (mesa && !Number.isNaN(Number(mesa))) {
      setMesaFromQr(Number(mesa));
    }
  }, []);

  // Reflete instantaneamente quando o administrador abre/fecha o restaurante
  // ou muda outras configurações, mesmo com o cardápio já aberto no celular do cliente.
  useWebSocket(event => {
    if (event.type === 'configuracao:atualizada') {
      setConfig(event.payload);
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  if (!config) {
    return <div className="min-h-screen flex items-center justify-center opacity-60">Carregando...</div>;
  }

  let content: React.ReactNode = null;
  if (mode === 'landing') {
    content = <LandingPage onGoClient={() => setMode('identify')} />;
  } else if (mode === 'identify') {
    content = (
      <IdentifyPage
        mesaFromQr={mesaFromQr}
        config={config}
        onIdentified={(mesaId, nome) => { setIdentificacao(mesaId, nome); setMode('menu'); }}
      />
    );
  } else if (mode === 'menu') {
    content = <MenuPage restaurantOpen={config.restaurantOpen} onOrderSubmitted={pedido => { setLastOrder(pedido); setMode('confirm'); }} />;
  } else if (mode === 'confirm' && lastOrder) {
    content = <ConfirmPage pedido={lastOrder} onNewOrder={() => setMode('menu')} />;
  }

  return (
    <>
      <img src={iconSrc} alt="" aria-hidden="true" className="logo-watermark" />
      <div className="wood-frame" aria-hidden="true" />
      <div className="relative z-[1]">{content}</div>
    </>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppInner />
    </SessionProvider>
  );
}
