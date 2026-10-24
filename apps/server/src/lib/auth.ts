import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Papel } from '@sol-e-lua/shared';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-troque-em-producao';

export interface JwtPayload {
  sub: string;
  usuario: string;
  papel: Papel;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
