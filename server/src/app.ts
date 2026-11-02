import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { ZodError } from 'zod';
import { config } from './config.js';
import { connectDb, db } from './db.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';

export const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: { directives: { ...helmet.contentSecurityPolicy.getDefaultDirectives(), 'upgrade-insecure-requests': null,
  'img-src': ["'self'", 'data:', 'https:'], 'frame-src': ["'self'", 'https://www.google.com'], 'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], 'font-src': ["'self'", 'https://fonts.gstatic.com'] } } }));
if (config.clientUrls.length) app.use(cors({ origin: config.clientUrls, credentials: true }));
app.use(express.json({ limit: '6mb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 60_000, limit: 200, standardHeaders: true, legacyHeaders: false }));

// Connect to MongoDB before any API call (cached after the first call)
app.use('/api', async (_req, res, next) => {
  try { await connectDb(); next(); } catch (e: any) { console.error('[db] connection failed:', e.message); res.status(503).json({ error: 'Database is not reachable. Check MONGODB_URI and the Atlas network access list.' }); }
});

// Open /api/health to check the MongoDB connection
app.get('/api/health', async (_req, res) => {
  try { await db().command({ ping: 1 }); res.json({ ok: true, mongodb: 'connected', database: config.dbName }); }
  catch { res.status(500).json({ ok: false, mongodb: 'not connected' }); }
});
app.use('/api/admin', adminRouter);
app.use('/api', publicRouter);
app.use('/api', (_req, res) => void res.status(404).json({ error: 'Not found' }));

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) return void res.status(400).json({ error: err.issues[0]?.message || 'Invalid data.' });
  if (err?.code === 11000) return void res.status(409).json({ error: 'This mobile number already exists.' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

