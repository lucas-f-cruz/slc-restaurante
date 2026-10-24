import { and, eq, inArray, ne } from 'drizzle-orm';
import { db } from '../db/client.js';
import { mesas, pedidos } from '../db/schema.js';
import { deriveMesaStatus, type MesaComStatus } from '@sol-e-lua/shared';

const STATUS_ATIVOS = ['novo', 'preparando', 'pronto', 'entregue'] as const;

export async function getPedidosAtivosDaMesa(mesaId: number) {
  return db.select().from(pedidos).where(
    and(eq(pedidos.mesaId, mesaId), inArray(pedidos.status, [...STATUS_ATIVOS]))
  );
}

export async function toMesaComStatus(mesa: typeof mesas.$inferSelect): Promise<MesaComStatus> {
  const ativos = await getPedidosAtivosDaMesa(mesa.id);
  const status = deriveMesaStatus(ativos, mesa.statusManual ?? null);
  const emAndamento = ativos.find(p => p.status === 'novo' || p.status === 'preparando' || p.status === 'pronto');
  return {
    id: mesa.id,
    rotulo: mesa.rotulo,
    clienteAtual: mesa.clienteAtual,
    statusManual: mesa.statusManual ?? null,
    status,
    pedidoAtualId: emAndamento?.id ?? ativos[ativos.length - 1]?.id ?? null
  };
}

export async function listMesasComStatus(): Promise<MesaComStatus[]> {
  const todas = await db.select().from(mesas);
  return Promise.all(todas.map(toMesaComStatus));
}

export async function temPedidoAtivo(mesaId: number): Promise<boolean> {
  const ativos = await getPedidosAtivosDaMesa(mesaId);
  return ativos.length > 0;
}
