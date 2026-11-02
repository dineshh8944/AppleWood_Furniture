import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import { store } from './format';
import type { CartItem, CustomerSession, Product } from './types';

interface Ctx {
  customer: CustomerSession | null; login: (f: { name: string; mobile: string; email: string }) => Promise<void>; logout: () => void;
  cart: CartItem[]; add: (p: Product, color: string, material?: string) => void; setQty: (key: string, q: number) => void; remove: (key: string) => void; clear: () => void; count: number;
}
const C = createContext<Ctx>(null!);
export const useShop = () => useContext(C);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerSession | null>(() => store.read('aw_customer', null));
  const [cart, setCartState] = useState<CartItem[]>(() => store.read('aw_cart', []));
  const setCart = (c: CartItem[]) => { setCartState(c); store.write('aw_cart', c); };

  const value = useMemo<Ctx>(() => ({
    customer, cart, count: cart.reduce((s, i) => s + i.quantity, 0),
    async login(f) { const r = await api<{ customer: CustomerSession }>('/customers/login', { method: 'POST', body: f }); setCustomer(r.customer); store.write('aw_customer', r.customer); },
    logout() { setCustomer(null); store.remove('aw_customer'); },
    add(p, color, material) {
      const mat = material || p.material; const key = `${p.id}-${color}-${mat}`;
      setCart(cart.some((i) => i.key === key) ? cart.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i)) : [...cart, { key, id: p.id, name: p.name, category: p.category, material: mat, color, image: p.image, quantity: 1 }]);
    },
    setQty(key, q) { setCart(cart.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, q) } : i))); },
    remove(key) { setCart(cart.filter((i) => i.key !== key)); },
    clear() { setCart([]); },
  }), [customer, cart]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
