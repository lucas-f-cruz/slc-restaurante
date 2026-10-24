import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { eq, ne, and } from 'drizzle-orm';
import { db } from '../db/client.js';
import { usuarios } from '../db/schema.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { hashPassword } from '../lib/auth.js';

export const usuariosRouter = Router();

function toPublic(u: typeof usuarios.$inferSelect) {
  return { id: u.id, nome: u.nome, usuario: u.usuario, papel: u.papel, ativo: u.ativo };
}

usuariosRouter.get('/usuarios', requireAuth, requirePermission('manageUsers'), async (_req, res) => {
  const rows = await db.select().from(usuarios);
  res.json(rows.map(toPublic));
});

const criarSchema = z.object({
  nome: z.string().min(1),
  usuario: z.string().min(3),
  senha: z.string().min(3),
  papel: z.enum(['admin', 'cozinha', 'recepcao'])
});

usuariosRouter.post('/usuarios', requireAuth, requirePermission('manageUsers'), async (req, res) => {
  const parsed = criarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });

  const [existe] = await db.select().from(usuarios).where(eq(usuarios.usuario, parsed.data.usuario));
  if (existe) return res.status(409).json({ error: 'Já existe um usuário com esse nome de usuário' });

  const senhaHash = await hashPassword(parsed.data.senha);
  const id = randomUUID();
  await db.insert(usuarios).values({
    id, nome: parsed.data.nome, usuario: parsed.data.usuario, senhaHash, papel: parsed.data.papel, ativo: true
  });
  const [criado] = await db.select().from(usuarios).where(eq(usuarios.id, id));
  res.status(201).json(toPublic(criado!));
});

const editarSchema = z.object({
  nome: z.string().min(1).optional(),
  usuario: z.string().min(3).optional(),
  papel: z.enum(['admin', 'cozinha', 'recepcao']).optional(),
  senha: z.string().min(3).optional()
});

usuariosRouter.patch('/usuarios/:id', requireAuth, requirePermission('manageUsers'), async (req, res) => {
  const parsed = editarSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });

  if (parsed.data.usuario) {
    const [dup] = await db.select().from(usuarios).where(
      and(eq(usuarios.usuario, parsed.data.usuario), ne(usuarios.id, req.params.id))
    );
    if (dup) return res.status(409).json({ error: 'Já existe um usuário com esse nome de usuário' });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.nome) updates.nome = parsed.data.nome;
  if (parsed.data.usuario) updates.usuario = parsed.data.usuario;
  if (parsed.data.papel) updates.papel = parsed.data.papel;
  if (parsed.data.senha) updates.senhaHash = await hashPassword(parsed.data.senha);

  await db.update(usuarios).set(updates).where(eq(usuarios.id, req.params.id));
  const [atualizado] = await db.select().from(usuarios).where(eq(usuarios.id, req.params.id));
  if (!atualizado) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(toPublic(atualizado));
});

usuariosRouter.patch('/usuarios/:id/ativo', requireAuth, requirePermission('manageUsers'), async (req, res) => {
  if (req.params.id === req.user!.sub) {
    return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário' });
  }
  const schema = z.object({ ativo: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });

  await db.update(usuarios).set({ ativo: parsed.data.ativo }).where(eq(usuarios.id, req.params.id));
  res.json({ ok: true });
});

usuariosRouter.delete('/usuarios/:id', requireAuth, requirePermission('manageUsers'), async (req, res) => {
  if (req.params.id === req.user!.sub) {
    return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
  }
  const admins = await db.select().from(usuarios).where(and(eq(usuarios.papel, 'admin'), eq(usuarios.ativo, true)));
  const [alvo] = await db.select().from(usuarios).where(eq(usuarios.id, req.params.id));
  if (alvo?.papel === 'admin' && admins.length <= 1) {
    return res.status(400).json({ error: 'É preciso manter ao menos um administrador ativo' });
  }
  await db.delete(usuarios).where(eq(usuarios.id, req.params.id));
  res.json({ ok: true });
});
