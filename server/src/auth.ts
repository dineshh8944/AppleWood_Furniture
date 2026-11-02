import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from './db.js';

export const COOKIE = 'aw_admin';
import { config } from './config.js';
export const cookieOptions = (req: Request) => (config.clientUrls.length
  ? { httpOnly: true, sameSite: 'none' as const, secure: true, maxAge: 8 * 3600_000 }
  : { httpOnly: true, sameSite: 'strict' as const, secure: req.secure, maxAge: 8 * 3600_000 });
export const signAdmin = async (email: string) => jwt.sign({ email, role: 'owner' }, await jwtSecret(), { expiresIn: '8h' });

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const p = jwt.verify(req.cookies?.[COOKIE] ?? '', await jwtSecret()) as { email: string; role: string };
    if (p.role !== 'owner') throw new Error('bad role');
    (req as Request & { adminEmail: string }).adminEmail = p.email;
    next();
  } catch { res.status(401).json({ error: 'Not signed in' }); }
}
export const adminEmailOf = (req: Request) => (req as Request & { adminEmail: string }).adminEmail;
