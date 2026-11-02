import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import type { Collection, Document } from 'mongodb';
import { cols, nextId } from '../db.js';
import { COOKIE, adminEmailOf, cookieOptions, requireAdmin, signAdmin } from '../auth.js';
import { schemas, type Resource } from '../validation.js';

export const adminRouter = Router();
const now = () => new Date().toISOString();
const out = ({ _id, ...r }: Document) => ({ id: _id, ...r });
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

// ---------- owner sign in (the only account allowed into the dashboard) ----------
adminRouter.post('/login', rateLimit({ windowMs: 15 * 60_000, limit: 10, message: { error: 'Too many attempts. Try again in 15 minutes.' } }), async (req, res) => {
  const { email, password } = z.object({ email: z.string().trim().toLowerCase().max(120), password: z.string().max(200) }).parse(req.body);
  const admin = await cols.admins().findOne({ email });
  const ok = bcrypt.compareSync(password, admin?.passwordHash ?? DUMMY_HASH) && !!admin;
  if (!ok) return void res.status(401).json({ error: 'Wrong email or password.' });
  res.cookie(COOKIE, await signAdmin(admin!.email), cookieOptions(req)).json({ ok: true, email: admin!.email });
});
adminRouter.post('/logout', (_req, res) => void res.clearCookie(COOKIE).json({ ok: true }));

adminRouter.use(requireAdmin);
adminRouter.get('/me', (req, res) => void res.json({ ok: true, email: adminEmailOf(req) }));

adminRouter.post('/password', async (req, res) => {
  const { current, next } = z.object({ current: z.string(), next: z.string().min(8, 'New password must be at least 8 characters.').max(200) }).parse(req.body);
  const admin = await cols.admins().findOne({ email: adminEmailOf(req) });
  if (!admin || !bcrypt.compareSync(current, admin.passwordHash)) return void res.status(400).json({ error: 'Current password is wrong.' });
  await cols.admins().updateOne({ _id: admin._id }, { $set: { passwordHash: bcrypt.hashSync(next, 10), seededPassword: false } });
  res.json({ ok: true });
});

// ---------- dashboard summary ----------
adminRouter.get('/stats', async (_req, res) => {
  const active = { deletedAt: null };
  const [customers, enquiries, requests, products] = await Promise.all([
    cols.customers().find(active).toArray(), cols.enquiries().find(active).sort({ _id: -1 }).toArray(),
    cols.requests().find(active).sort({ _id: -1 }).toArray(), cols.products().find(active).toArray(),
  ]);
  const low = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= (p.reorderLevel ?? 5)).length;
  const out_ = products.filter((p) => (p.stock ?? 0) <= 0).length;
  const events = await cols.loginEvents().find().sort({ _id: -1 }).limit(5000).toArray();
  const days: { date: string; logins: number }[] = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10); days.push({ date: d, logins: events.filter((e) => e.at.slice(0, 10) === d).length }); }
  const count = <T extends { status: string }>(rows: T[]) => ({ New: rows.filter((r) => r.status === 'New').length, Contacted: rows.filter((r) => r.status === 'Contacted').length, Closed: rows.filter((r) => r.status === 'Closed').length });
  const byInterest: Record<string, number> = {};
  enquiries.forEach((e) => { byInterest[e.interest] = (byInterest[e.interest] || 0) + 1; });
  res.json({
    totals: { customers: customers.length, enquiries: enquiries.length, requests: requests.length, products: products.length, lowStock: low, outOfStock: out_, logins: events.length, loginsToday: days[13].logins },
    enquiryStatus: count(enquiries), requestStatus: count(requests), enquiriesByInterest: byInterest, loginsPerDay: days,
    recentEnquiries: enquiries.slice(0, 5).map(out), recentRequests: requests.slice(0, 5).map(out), recentLogins: events.slice(0, 8).map(out),
  });
});

// ---------- login activity (read-only history, cannot be edited or removed) ----------
adminRouter.get('/login-events', async (_req, res) => {
  res.json((await cols.loginEvents().find().sort({ _id: -1 }).limit(5000).toArray()).map(out));
});

// ---------- CRUD for customers, enquiries, requests, products ----------
// "Delete" ARCHIVES the record (deletedAt is set). Nothing is ever erased; archived records can be restored.
const RESOURCES = Object.keys(schemas) as Resource[];
adminRouter.param('resource', (req, res, next, v) => (RESOURCES.includes(v as Resource) ? next() : void res.status(404).json({ error: 'Not found' })));
type Doc = Document & { _id: number };
const col = (r: Resource) => (cols[r]() as unknown as Collection<Doc>);
const defaults = (r: Resource): Document => (r === 'customers' ? { loginCount: 0, lastLoginAt: null } : r === 'requests' ? { items: [] } : {});

// Products list also carries how many times each product was ordered (for the "Top Items" tab)
adminRouter.get('/products', async (req, res) => {
  const items = await cols.products().find({ deletedAt: req.query.archived ? { $ne: null } : null }).sort({ _id: -1 }).toArray();
  const ordered: Record<number, number> = {};
  for (const r of await cols.requests().find({ deletedAt: null }).toArray()) for (const i of r.items) ordered[i.id] = (ordered[i.id] || 0) + i.quantity;
  res.json(items.map((p) => ({ ...out(p), stock: p.stock ?? 0, reorderLevel: p.reorderLevel ?? 5, cost: p.cost ?? 0, price: p.price ?? 0, sku: p.sku ?? '', grade: p.grade ?? '', ordered: ordered[p._id] || 0 })));
});

adminRouter.get('/:resource', async (req, res) => {
  const r = req.params.resource as Resource;
  res.json((await col(r).find({ deletedAt: req.query.archived ? { $ne: null } : null }).sort({ _id: -1 }).toArray()).map(out));
});
adminRouter.post('/:resource', async (req, res) => {
  const r = req.params.resource as Resource;
  const data = schemas[r].parse(req.body);
  await col(r).insertOne({ _id: await nextId(r), ...data, ...defaults(r), createdAt: now(), deletedAt: null } as Doc);
  res.json({ ok: true });
});
adminRouter.put('/:resource/:id', async (req, res) => {
  const r = req.params.resource as Resource;
  const data = Object.fromEntries(Object.entries(schemas[r].partial().parse(req.body)).filter(([, v]) => v !== undefined));
  if (Object.keys(data).length) await col(r).updateOne({ _id: Number(req.params.id) }, { $set: data });
  res.json({ ok: true });
});
// Delete = move to Archived (restorable). Only the owner is signed in here, and only an
// already-archived record can be erased for good with ?permanent=1.
adminRouter.delete('/:resource/:id', async (req, res) => {
  const c = col(req.params.resource as Resource); const _id = Number(req.params.id);
  if (req.query.permanent) {
    const rec = await c.findOne({ _id });
    if (!rec) return void res.status(404).json({ error: 'Not found' });
    if (!rec.deletedAt) return void res.status(400).json({ error: 'Archive the record first, then delete it permanently from the Archived tab.' });
    await c.deleteOne({ _id });
  } else await c.updateOne({ _id }, { $set: { deletedAt: now() } });
  res.json({ ok: true });
});
adminRouter.post('/:resource/:id/restore', async (req, res) => {
  await col(req.params.resource as Resource).updateOne({ _id: Number(req.params.id) }, { $set: { deletedAt: null } });
  res.json({ ok: true });
});
