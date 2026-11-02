export type Status = 'New' | 'Contacted' | 'Closed';
export const STATUSES: Status[] = ['New', 'Contacted', 'Closed'];
export const CATEGORIES = ['Sofas', 'Dining', 'Beds', 'Custom'] as const;

export interface Product { id: number; name: string; category: string; type: string; material: string; colors: string[]; tag: string; image: string; description: string }
export interface AdminProduct extends Product { grade: string; sku: string; stock: number; reorderLevel: number; cost: number; price: number; ordered: number; createdAt: string }
export interface CartItem { key: string; id: number; name: string; category: string; material: string; color: string; image: string; quantity: number }
export interface CustomerSession { name: string; mobile: string; email: string }

export interface Customer { id: number; name: string; mobile: string; email: string; loginCount: number; lastLoginAt: string | null; createdAt: string }
export interface Enquiry { id: number; name: string; mobile: string; email: string; interest: string; status: Status; note: string; createdAt: string }
export interface OrderItem { id: number; name: string; color: string; material: string; quantity: number }
export interface OrderRequest { id: number; name: string; mobile: string; address: string; items: OrderItem[]; status: Status; note: string; createdAt: string }
export interface LoginEvent { id: number; customerId: number; name: string; mobile: string; at: string; ip: string; device: string }

export interface Stats {
  totals: { customers: number; enquiries: number; requests: number; products: number; lowStock: number; outOfStock: number; logins: number; loginsToday: number };
  enquiryStatus: Record<Status, number>; requestStatus: Record<Status, number>;
  enquiriesByInterest: Record<string, number>; loginsPerDay: { date: string; logins: number }[];
  recentEnquiries: Enquiry[]; recentRequests: OrderRequest[]; recentLogins: LoginEvent[];
}
