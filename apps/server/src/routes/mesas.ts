import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { mesas } from '../db/schema.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { listMesasComStatus, toMesaComStatus, temPedidoAtivo } from '../services/mesas.js';
import { finalizarPedidosDaMesa } from '../services/pedidos.js';
import { broadcast } from '../ws/hub.js';

export const mesasRouter = Router();

// GET /mesas — autenticado (dashboard)
mesasRouter.get('/mesas', requireAuth, async (_req, res) => {
  res.json(await listMesasComStatus());
});

// GET /mesas/:id — público (cardápio do cliente valida a mesa ao identificar-se)
mesasRouter.get('/mesas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const [mesa] = await db.select().from(mesas).where(eq(mesas.id, id));
  if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });
  res.json(await toMesaComStatus(mesa));
});

const criarMesaSchema = z.object({ rotulo: z.string().min(1) });

mesasRouter.post('/mesas', requireAuth, requirePermission('manageTables'), async (req, res) => {
  const parsed = criarMesaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Informe um nome/número de mesa válido' });

  const [result] = await db.insert(mesas).values({ rotulo: parsed.data.rotulo });
  const [mesa] = await db.select().from(mesas).where(eq(mesas.id, result.insertId));
  const dto = await toMesaComStatus(mesa!);
  broadcast({ type: 'mesa:atualizada', payload: dto }, { onlyAuthenticated: true });
  res.status(201).json(dto);
});

mesasRouter.patch('/mesas/:id', requireAuth, requirePermission('manageTables'), async (req, res) => {
  const parsed = criarMesaSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });
  const id = Number(req.params.id);
  await db.update(mesas).set(parsed.data).where(eq(mesas.id, id));
  const [mesa] = await db.select().from(mesas).where(eq(mesas.id, id));
  if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });
  const dto = await toMesaComStatus(mesa);
  broadcast({ type: 'mesa:atualizada', payload: dto }, { onlyAuthenticated: true });
  res.json(dto);
});

mesasRouter.delete('/mesas/:id', requireAuth, requirePermission('manageTables'), async (req, res) => {
  const id = Number(req.params.id);
  if (await temPedidoAtivo(id)) {
    return res.status(409).json({
      error: 'Essa mesa possui pedidos em andamento. Não é possível remover a mesa enquanto houver pedidos ativos.'
    });
  }
  await db.delete(mesas).where(eq(mesas.id, id));
  res.json({ ok: true });
});

mesasRouter.post('/mesas/:id/fechar', requireAuth, requirePermission('closeMesa'), async (req, res) => {
  const id = Number(req.params.id);
  await finalizarPedidosDaMesa(id);
  const [mesa] = await db.select().from(mesas).where(eq(mesas.id, id));
  if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });
  const dto = await toMesaComStatus(mesa);
  broadcast({ type: 'mesa:atualizada', payload: dto }, { onlyAuthenticated: true });
  res.json(dto);
});

mesasRouter.post('/mesas/:id/liberar', requireAuth, requirePermission('closeMesa'), async (req, res) => {
  const id = Number(req.params.id);
  await finalizarPedidosDaMesa(id);
  await db.update(mesas).set({ clienteAtual: null, statusManual: null }).where(eq(mesas.id, id));
  const [mesa] = await db.select().from(mesas).where(eq(mesas.id, id));
  if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });
  const dto = await toMesaComStatus(mesa);
  broadcast({ type: 'mesa:atualizada', payload: dto }, { onlyAuthenticated: true });
  res.json(dto);
});
