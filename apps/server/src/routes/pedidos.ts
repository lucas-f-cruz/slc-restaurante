import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { mesas, configuracoes } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { buildPedidoDTO, listPedidos, criarPedido, avancarStatus } from '../services/pedidos.js';
import { toMesaComStatus } from '../services/mesas.js';
import { broadcast } from '../ws/hub.js';

export const pedidosRouter = Router();

const criarPedidoSchema = z.object({
  mesaId: z.number().int().positive(),
  clienteNome: z.string().min(1),
  observacao: z.string().optional(),
  itens: z.array(z.object({ produtoId: z.string().min(1), quantidade: z.number().int().positive() })).min(1)
});

// POST /pedidos — público, usado pelo cardápio do cliente
pedidosRouter.post('/pedidos', async (req, res) => {
  const parsed = criarPedidoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados do pedido inválidos' });

  // Nunca confiar só no front-end: se o restaurante estiver marcado como fechado,
  // bloquear a criação do pedido aqui também.
  const [restaurantOpenRow] = await db.select().from(configuracoes).where(eq(configuracoes.chave, 'restaurantOpen'));
  if (restaurantOpenRow && restaurantOpenRow.valor === 'false') {
    return res.status(409).json({ error: 'Restaurante fechado no momento. Não é possível enviar novos pedidos.' });
  }

  const [mesa] = await db.select().from(mesas).where(eq(mesas.id, parsed.data.mesaId));
  if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });

  try {
    const pedido = await criarPedido(parsed.data);

    // atualiza o "cliente atual" da mesa para exibição no dashboard
    if (!mesa.clienteAtual) {
      await db.update(mesas).set({ clienteAtual: parsed.data.clienteNome, statusManual: null }).where(eq(mesas.id, mesa.id));
    }

    broadcast({ type: 'pedido:novo', payload: pedido }, { onlyAuthenticated: true });
    const mesaAtualizada = await toMesaComStatus({ ...mesa, clienteAtual: mesa.clienteAtual ?? parsed.data.clienteNome });
    broadcast({ type: 'mesa:atualizada', payload: mesaAtualizada }, { onlyAuthenticated: true });

    res.status(201).json(pedido);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /pedidos — autenticado (dashboard), filtro opcional por status
pedidosRouter.get('/pedidos', requireAuth, async (req, res) => {
  const status = req.query.status as string | undefined;
  const pedidos = await listPedidos(status ? { status: status as any } : undefined);
  res.json(pedidos);
});

pedidosRouter.get('/pedidos/:id', requireAuth, async (req, res) => {
  const dto = await buildPedidoDTO(Number(req.params.id));
  if (!dto) return res.status(404).json({ error: 'Pedido não encontrado' });
  res.json(dto);
});

// PATCH /pedidos/:id/status — avança para o próximo status do fluxo (sem "aceitar/recusar")
pedidosRouter.patch('/pedidos/:id/status', requireAuth, async (req, res) => {
  try {
    const pedido = await avancarStatus(Number(req.params.id));
    broadcast({ type: 'pedido:status', payload: { pedidoId: pedido.id, status: pedido.status, timeline: pedido.timeline } });

    const [mesa] = await db.select().from(mesas).where(eq(mesas.id, pedido.mesaId));
    if (mesa) {
      const mesaDto = await toMesaComStatus(mesa);
      broadcast({ type: 'mesa:atualizada', payload: mesaDto }, { onlyAuthenticated: true });
    }
    res.json(pedido);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
