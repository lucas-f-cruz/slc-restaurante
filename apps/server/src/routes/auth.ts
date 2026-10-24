import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { usuarios } from '../db/schema.js';
import { signToken, verifyPassword } from '../lib/auth.js';
import type { LoginResponse, Usuario } from '@sol-e-lua/shared';

export const authRouter = Router();

const loginSchema = z.object({
  usuario: z.string().min(1),
  senha: z.string().min(1)
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos' });

  const [row] = await db.select().from(usuarios).where(eq(usuarios.usuario, parsed.data.usuario));
  if (!row || !row.ativo) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos, ou usuário desativado.' });
  }
  const ok = await verifyPassword(parsed.data.senha, row.senhaHash);
  if (!ok) return res.status(401).json({ error: 'Usuário ou senha inválidos, ou usuário desativado.' });

  const usuario: Usuario = { id: row.id, nome: row.nome, usuario: row.usuario, papel: row.papel, ativo: row.ativo };
  const token = signToken({ sub: row.id, usuario: row.usuario, papel: row.papel });

  const response: LoginResponse = { token, usuario };
  res.json(response);
});
