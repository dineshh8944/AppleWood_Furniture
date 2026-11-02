import { Router } from 'express';
import { cols, nextId } from '../db.js';
import { customerLogin, enquiryPublic, orderPublic } from '../validation.js';

export const publicRouter = Router();
const now = () => new Date().toISOString();
// Customers only ever see these fields: no price, cost, stock or SKU.
const productOut = (p: any) => ({ id: p._id, name: p.name, category: p.category, type: p.type, material: p.material, colors: p.colors, tag: p.tag, image: p.image, description: p.description });

publicRouter.get('/products', async (_req, res) => {
  res.json((await cols.products().find({ deletedAt: null }).sort({ _id: 1 }).toArray()).map(productOut));
});

// Customer "login": name + mobile. Saved as a customer record and every visit is logged.
publicRouter.post('/customers/login', async (req, res) => {
  const { name, mobile, email } = customerLogin.parse(req.body);
  const t = now();
  // Stored customer data is permanent: a returning login only adds a visit. It never overwrites the saved
  // name or email (only fills in an email that was empty). Each sign-in is also kept in loginEvents.
  const update = async (cur: { email: string }) => cols.customers().updateOne({ mobile }, { $set: { lastLoginAt: t, ...(email && !cur.email ? { email } : {}) }, $inc: { loginCount: 1 } });
  let customer = await cols.customers().findOne({ mobile });
  if (customer) await update(customer);
  else {
    try { await cols.customers().insertOne({ _id: await nextId('customers'), name, mobile, email, loginCount: 1, lastLoginAt: t, createdAt: t, deletedAt: null }); }
    catch (e: any) { if (e?.code === 11000) await update({ email: '' }); else throw e; }
  }
  customer = (await cols.customers().findOne({ mobile }))!;
  await cols.loginEvents().insertOne({ _id: await nextId('loginEvents'), customerId: customer._id, name, mobile, at: t, ip: req.ip || '', device: String(req.get('user-agent') || '').slice(0, 200) });
  res.json({ ok: true, customer: { name: customer.name, mobile, email: customer.email } });
});

publicRouter.post('/enquiries', async (req, res) => {
  const d = enquiryPublic.parse(req.body);
  await cols.enquiries().insertOne({ _id: await nextId('enquiries'), ...d, status: 'New', note: '', createdAt: now(), deletedAt: null });
  res.json({ ok: true });
});

publicRouter.post('/requests', async (req, res) => {
  const d = orderPublic.parse(req.body);
  const items = [];
  for (const i of d.items) {
    const p = await cols.products().findOne({ _id: i.id, deletedAt: null });
    if (p) items.push({ id: p._id, name: p.name, color: i.color, material: i.material, quantity: i.quantity });
  }
  if (!items.length) return void res.status(400).json({ error: 'Your bag is empty.' });
  await cols.requests().insertOne({ _id: await nextId('requests'), name: d.name, mobile: d.mobile, address: d.address, items, status: 'New', note: '', createdAt: now(), deletedAt: null });
  res.json({ ok: true });
});
