import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useLiveData } from '../lib/LiveDataContext';
import { useTheme } from '../lib/ThemeContext';
import { pad2 } from '../lib/format';

function qrUrlFor(mesaId: number) {
  const clientBase = import.meta.env.VITE_CLIENT_URL ?? window.location.origin.replace('5174', '5173');
  return `${clientBase}/?mesa=${pad2(mesaId)}`;
}

export function QRCodesPage() {
  const { mesas } = useLiveData();
  const { isDark } = useTheme();

  async function download(mesaId: number) {
    const url = await QRCode.toDataURL(qrUrlFor(mesaId), { width: 320, margin: 2 });
    const a = document.createElement('a');
    a.href = url; a.download = `qrcode-mesa-${pad2(mesaId)}.png`; a.click();
  }

  async function printOne(mesaId: number) {
    const url = await QRCode.toDataURL(qrUrlFor(mesaId), { width: 280, margin: 2 });
    openPrintWindow(`<div style="text-align:center;padding:60px;font-family:sans-serif;">
      <h1>Mesa ${pad2(mesaId)}</h1><img src="${url}" style="width:280px;height:280px;"><p>${qrUrlFor(mesaId)}</p></div>`);
  }

  async function printAll() {
    const items = await Promise.all(mesas.map(async m => ({
      m, url: await QRCode.toDataURL(qrUrlFor(m.id), { width: 160, margin: 1 })
    })));
    const html = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:30px;padding:40px;font-family:sans-serif;">
      ${items.map(({ m, url }) => `<div style="text-align:center;"><h3>${m.rotulo}</h3><img src="${url}" style="width:160px;height:160px;"><p style="font-size:11px;">${qrUrlFor(m.id)}</p></div>`).join('')}
    </div>`;
    openPrintWindow(html);
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap mb-5">
        <div>
          <h2 className="font-display text-2xl text-[var(--ink)]">QR Codes das mesas</h2>
          <p className="text-[.82rem] opacity-60 mt-1">Cada mesa tem um código exclusivo — ao escanear, o cardápio já abre identificando a mesa</p>
        </div>
        <button onClick={printAll} className="px-4 py-2.5 rounded-[10px] font-bold text-[.82rem] bg-[var(--ink)] text-[var(--card)]">🖨️ Imprimir todos os QR Codes</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {mesas.map(m => (
          <QRTile key={m.id} mesaId={m.id} rotulo={m.rotulo} isDark={isDark} onDownload={() => download(m.id)} onPrint={() => printOne(m.id)} />
        ))}
      </div>
    </div>
  );
}

function QRTile({ mesaId, rotulo, isDark, onDownload, onPrint }: { mesaId: number; rotulo: string; isDark: boolean; onDownload: () => void; onPrint: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrUrlFor(mesaId), { width: 120, margin: 1, color: { dark: isDark ? '#F4EFE3' : '#5C2A1E', light: '#0000' } });
    }
  }, [mesaId, isDark]);

  return (
    <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] p-4.5 text-center flex flex-col items-center gap-2">
      <div className="font-display font-bold text-[var(--ink)]">{rotulo}</div>
      <canvas ref={canvasRef} className="rounded-lg" />
      <div className="text-[.68rem] opacity-55 break-all">{qrUrlFor(mesaId)}</div>
      <div className="flex gap-1.5 flex-wrap justify-center mt-1">
        <button onClick={onDownload} className="px-3 py-1.5 rounded-[10px] border border-[var(--line)] text-[.72rem] font-bold">Baixar</button>
        <button onClick={onPrint} className="px-3 py-1.5 rounded-[10px] border border-[var(--line)] text-[.72rem] font-bold">Imprimir</button>
      </div>
    </div>
  );
}

function openPrintWindow(html: string) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`<html><head><title>Imprimir</title></head><body>${html}</body></html>`);
  win.document.close();
  win.onload = () => win.print();
}
