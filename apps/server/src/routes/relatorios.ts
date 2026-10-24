import { Router } from 'express';
import { db } from '../db/client.js';
import { pedidos, itensPedido, mesas } from '../db/schema.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { listMesasComStatus } from '../services/mesas.js';

export const relatoriosRouter = Router();

relatoriosRouter.get('/relatorios/resumo', requireAuth, requirePermission('viewReports'), async (_req, res) => {
  const todos = await db.select().from(pedidos);
  const pendentes = todos.filter(p => p.status === 'novo').length;
  const preparo = todos.filter(p => p.status === 'preparando').length;
  const total = todos.length;
  const faturamento = todos.reduce((s, p) => s + Number(p.total), 0);
  const mesasComStatus = await listMesasComStatus();
  const ocupadas = mesasComStatus.filter(m => m.status !== 'livre').length;

  res.json({ total, pendentes, preparo, ocupadas, totalMesas: mesasComStatus.length, faturamento });
});

relatoriosRouter.get('/relatorios/pedidos-por-hora', requireAuth, requirePermission('viewReports'), async (_req, res) => {
  const todos = await db.select().from(pedidos);
  const byHour: Record<number, number> = {};
  for (const p of todos) {
    const h = p.criadoEm.getHours();
    byHour[h] = (byHour[h] ?? 0) + 1;
  }
  res.json(byHour);
});

relatoriosRouter.get('/relatorios/produtos-mais-vendidos', requireAuth, requirePermission('viewReports'), async (_req, res) => {
  const itens = await db.select().from(itensPedido);
  const counts: Record<string, number> = {};
  for (const it of itens) counts[it.nomeProduto] = (counts[it.nomeProduto] ?? 0) + it.quantidade;
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  res.json(ranked.map(([nome, quantidade]) => ({ nome, quantidade })));
});

relatoriosRouter.get('/relatorios/mesas-mais-usadas', requireAuth, requirePermission('viewReports'), async (_req, res) => {
  const todos = await db.select().from(pedidos);
  const counts: Record<number, number> = {};
  for (const p of todos) counts[p.mesaId] = (counts[p.mesaId] ?? 0) + 1;
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  res.json(ranked.map(([mesaId, quantidade]) => ({ mesaId: Number(mesaId), quantidade })));
});
