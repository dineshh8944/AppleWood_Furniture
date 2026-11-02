export type Status = 'New' | 'Contacted' | 'Closed';
export const STATUSES: Status[] = ['New', 'Contacted', 'Closed'];
export const CATEGORIES = ['Sofas', 'Dining', 'Beds', 'Custom'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Every record has a numeric id, and is archived (never erased) when "deleted". */
export interface Base { _id: number; createdAt: string; deletedAt: string | null }

export interface Customer extends Base { name: string; mobile: string; email: string; loginCount: number; lastLoginAt: string | null }
export interface Enquiry extends Base { name: string; mobile: string; email: string; interest: string; status: Status; note: string }
export interface OrderItem { id: number; name: string; color: string; material: string; quantity: number }
export interface OrderRequest extends Base { name: string; mobile: string; address: string; items: OrderItem[]; status: Status; note: string }
export interface Product extends Base { name: string; category: Category; type: string; grade: string; sku: string; stock: number; reorderLevel: number; cost: number; price: number; material: string; colors: string[]; tag: string; image: string; description: string }
export interface LoginEvent { _id: number; customerId: number; name: string; mobile: string; at: string; ip: string; device: string }
export interface AdminUser { _id: number; email: string; passwordHash: string; seededPassword?: boolean; createdAt: string }
