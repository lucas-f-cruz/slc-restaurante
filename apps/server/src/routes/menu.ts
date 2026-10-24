import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { secoesCardapio, produtos } from '../db/schema.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { broadcast } from '../ws/hub.js';

export const menuRouter = Router();

// GET /menu — público, usado pelo cardápio do cliente
menuRouter.get('/menu', async (_req, res) => {
  const secoes = await db.select().from(secoesCardapio).orderBy(secoesCardapio.ordem);
  const todosProdutos = await db.select().from(produtos);

  const result = secoes.map(secao => ({
    id: secao.id,
    titulo: secao.titulo,
    categoriaChave: secao.categoriaChave,
    icone: secao.icone,
    corHex: secao.corHex,
    produtos: todosProdutos
      .filter(p => p.secaoId === secao.id)
      .map(p => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: Number(p.preco),
        tempoPreparo: p.tempoPreparo,
        disponivel: p.disponivel,
        destaque: p.destaque
      }))
  }));

  res.json(result);
});

// GET /produtos — autenticado, usado pelo dashboard (visão administrativa plana)
menuRouter.get('/produtos', requireAuth, async (_req, res) => {
  const rows = await db.select().from(produtos);
  res.json(rows.map(p => ({ ...p, preco: Number(p.preco) })));
});

const editProdutoSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().nullable().optional(),
  preco: z.number().positive().optional(),
  disponivel: z.boolean().optional()
});

menuRouter.patch('/produtos/:id', requireAuth, requirePermission('changePrices'), async (req, res) => {
  const parsed = editProdutoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });

  const updates: Record<string, unknown> = {};
  if (parsed.data.nome !== undefined) updates.nome = parsed.data.nome;
  if (parsed.data.descricao !== undefined) updates.descricao = parsed.data.descricao;
  if (parsed.data.preco !== undefined) updates.preco = parsed.data.preco.toFixed(2);
  if (parsed.data.disponivel !== undefined) updates.disponivel = parsed.data.disponivel;

  await db.update(produtos).set(updates).where(eq(produtos.id, req.params.id));

  if (parsed.data.disponivel !== undefined) {
    broadcast({ type: 'produto:disponibilidade', payload: { produtoId: req.params.id, disponivel: parsed.data.disponivel } });
  }
  res.json({ ok: true });
});

// PATCH /produtos/:id/disponibilidade — toggle rápido (tela "Disponibilidade")
menuRouter.patch('/produtos/:id/disponibilidade', requireAuth, requirePermission('toggleAvailability'), async (req, res) => {
  const schema = z.object({ disponivel: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });

  await db.update(produtos).set({ disponivel: parsed.data.disponivel }).where(eq(produtos.id, req.params.id));
  broadcast({ type: 'produto:disponibilidade', payload: { produtoId: req.params.id, disponivel: parsed.data.disponivel } });
  res.json({ ok: true });
});
