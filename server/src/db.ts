import { MongoClient, type Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { seedProducts } from './seed.js';
import type { AdminUser, Customer, Enquiry, LoginEvent, OrderRequest, Product } from './types.js';

const client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
let _db: Db;
export const db = () => _db;

export const cols = {
  customers: () => _db.collection<Customer>('customers'),
  enquiries: () => _db.collection<Enquiry>('enquiries'),
  requests: () => _db.collection<OrderRequest>('requests'),
  products: () => _db.collection<Product>('products'),
  loginEvents: () => _db.collection<LoginEvent>('loginEvents'),
  admins: () => _db.collection<AdminUser>('admins'),
  settings: () => _db.collection<{ _id: string; value: string }>('settings'),
  counters: () => _db.collection<{ _id: string; seq: number }>('counters'),
};

/** Simple 1, 2, 3... ids per collection. */
export async function nextId(name: string): Promise<number> {
  const r = await cols.counters().findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
  return r!.seq;
}

let ready: Promise<void> | null = null;
/** Connects once and reuses the connection (important on Vercel, where the function is reused between requests). */
export const connectDb = (): Promise<void> => (ready ??= init().catch((e) => { ready = null; throw e; }));

async function init(): Promise<void> {
  await client.connect();
  _db = client.db(config.dbName);
  await _db.command({ ping: 1 });
  console.log(`[db] Connected to MongoDB, database "${config.dbName}"`);
  await cols.customers().createIndex({ mobile: 1 }, { unique: true });
  await cols.admins().createIndex({ email: 1 }, { unique: true });
  await cols.loginEvents().createIndex({ at: -1 });

  const now = new Date().toISOString();
  if ((await cols.products().countDocuments()) === 0) {
    for (const p of seedProducts) await cols.products().insertOne({ _id: await nextId('products'), ...p, createdAt: now, deletedAt: null });
  }
  await syncOwner();
}

/**
 * The dashboard owner account. Only this one account can open the dashboard; no API can add another.
 * - created from .env the first time
 * - follows .env if the email changed, or if the password was never changed from the dashboard
 *   (this also repairs an owner created by an older version with the old default password)
 */
export async function syncOwner(): Promise<void> {
  const now = new Date().toISOString();
  const owner = await cols.admins().findOne({});
  if (!owner) {
    await cols.admins().insertOne({ _id: await nextId('admins'), email: config.adminEmail, passwordHash: bcrypt.hashSync(config.adminPassword, 10), seededPassword: true, createdAt: now });
    console.log(`[setup] Dashboard owner created: ${config.adminEmail}`);
    return;
  }
  const matches = bcrypt.compareSync(config.adminPassword, owner.passwordHash);
  const legacyDefault = owner.seededPassword === undefined && bcrypt.compareSync('12Jas34@mine', owner.passwordHash);
  if (owner.email !== config.adminEmail) {
    await cols.admins().updateOne({ _id: owner._id }, { $set: { email: config.adminEmail, passwordHash: bcrypt.hashSync(config.adminPassword, 10), seededPassword: true } });
    console.log(`[setup] Dashboard owner updated to: ${config.adminEmail}`);
  } else if (!matches && (owner.seededPassword === true || legacyDefault)) {
    await cols.admins().updateOne({ _id: owner._id }, { $set: { passwordHash: bcrypt.hashSync(config.adminPassword, 10), seededPassword: true } });
    console.log('[setup] Dashboard owner password refreshed from .env');
  }
}

export async function jwtSecret(): Promise<string> {
  if (config.jwtSecret) return config.jwtSecret;
  const found = await cols.settings().findOne({ _id: 'jwtSecret' });
  if (found) return found.value;
  const value = (await import('node:crypto')).randomBytes(32).toString('hex');
  try { await cols.settings().insertOne({ _id: 'jwtSecret', value }); return value; }
  catch { return (await cols.settings().findOne({ _id: 'jwtSecret' }))!.value; }
}
