import { z } from 'zod';
import { CATEGORIES, STATUSES } from './types.js';

export const name = z.string().trim().min(2, 'Name is required.').max(80);
export const mobile = z.string().transform((v) => v.replace(/\D/g, '')).refine((d) => d.length >= 10 && d.length <= 13, 'Enter a valid 10-digit mobile number.').transform((d) => d.slice(-10));
export const email = z.string().trim().max(120).refine((v) => v === '' || /^\S+@\S+\.\S+$/.test(v), 'Email is not valid.');
const status = z.enum(STATUSES as [string, ...string[]]);
const note = z.string().trim().max(500);
const num = z.coerce.number().min(0).max(1e9);
const colors = z.array(z.string().trim().min(1).max(40)).max(8).transform((a) => (a.length ? a : ['Natural']));
const image = z.string().refine((v) => /^(data:image\/|https:\/\/)/.test(v) && v.length < 4_000_000, 'Image must be an uploaded file or an https link.');

export const customerLogin = z.object({ name, mobile, email: email.optional().default('') });
export const enquiryPublic = z.object({ name, mobile, email: email.optional().default(''), interest: z.string().trim().min(1).max(120) });
export const orderPublic = z.object({
  name, mobile, address: z.string().trim().min(5, 'Please enter your delivery address.').max(400),
  items: z.array(z.object({ id: z.coerce.number(), color: z.string().max(40).default(''), material: z.string().max(40).default(''), quantity: z.coerce.number().int().min(1).max(99) })).min(1, 'Your bag is empty.').max(50),
});

// Admin create / update schemas (update = every field optional)
export const schemas = {
  customers: z.object({ name, mobile, email: email.default('') }),
  enquiries: z.object({ name, mobile, email: email.default(''), interest: z.string().trim().min(1).max(120), status: status.default('New'), note: note.default('') }),
  requests: z.object({ name, mobile, address: z.string().trim().max(400).default(''), status: status.default('New'), note: note.default('') }),
  products: z.object({
    name: z.string().trim().min(2, 'Product name is required.').max(120), category: z.enum(CATEGORIES), type: z.string().trim().max(60).default(''), grade: z.string().trim().max(20).default(''), sku: z.string().trim().max(40).default(''),
    stock: num.default(0), reorderLevel: num.default(5), cost: num.default(0), price: num.default(0),
    material: z.string().trim().max(60).default(''), colors: colors.default(['Natural']), tag: z.string().trim().max(60).default(''), image, description: z.string().trim().max(600).default(''),
  }),
} as const;
export type Resource = keyof typeof schemas;
