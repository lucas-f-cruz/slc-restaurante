import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { configuracoes } from '../db/schema.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { broadcast } from '../ws/hub.js';
import type { Configuracoes } from '@sol-e-lua/shared';

export const configuracoesRouter = Router();

const DEFAULTS: Configuracoes = {
  restaurantName: 'Sol e Lua Café',
  address: '',
  phone: '',
  hours: '',
  tableIdMethod: 'both',
  soundEnabled: true,
  restaurantOpen: true
};

async function readAll(): Promise<Configuracoes> {
  const rows = await db.select().from(configuracoes);
  const map = Object.fromEntries(rows.map(r => [r.chave, r.valor]));
  return {
    restaurantName: map.restaurantName ?? DEFAULTS.restaurantName,
    address: map.address ?? DEFAULTS.address,
    phone: map.phone ?? DEFAULTS.phone,
    hours: map.hours ?? DEFAULTS.hours,
    tableIdMethod: (map.tableIdMethod as Configuracoes['tableIdMethod']) ?? DEFAULTS.tableIdMethod,
    soundEnabled: map.soundEnabled ? map.soundEnabled === 'true' : DEFAULTS.soundEnabled,
    restaurantOpen: map.restaurantOpen ? map.restaurantOpen === 'true' : DEFAULTS.restaurantOpen
  };
}

// GET /configuracoes — público (o cardápio do cliente precisa saber o método de identificação de mesa)
configuracoesRouter.get('/configuracoes', async (_req, res) => {
  res.json(await readAll());
});

const updateSchema = z.object({
  restaurantName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  hours: z.string().optional(),
  tableIdMethod: z.enum(['qr', 'manual', 'both']).optional(),
  soundEnabled: z.boolean().optional(),
  restaurantOpen: z.boolean().optional()
});

configuracoesRouter.patch('/configuracoes', requireAuth, requirePermission('manageSettings'), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });

  for (const [chave, valor] of Object.entries(parsed.data)) {
    await db
      .insert(configuracoes)
      .values({ chave, valor: String(valor) })
      .onDuplicateKeyUpdate({ set: { valor: String(valor) } });
  }

  const atual = await readAll();
  broadcast({ type: 'configuracao:atualizada', payload: atual });
  res.json(atual);
});
