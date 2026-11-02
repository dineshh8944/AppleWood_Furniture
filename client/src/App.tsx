import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ShopProvider, useShop } from './lib/session';
import { api } from './lib/api';
import type { Product } from './lib/types';
import Gate from './pages/shop/Gate';
import Layout from './pages/shop/Layout';
import Home from './pages/shop/Home';
import Shop from './pages/shop/Shop';
import Cart from './pages/shop/Cart';
import AdminApp from './pages/admin/AdminApp';

function CustomerSite() {
  const { customer } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { if (customer) api<Product[]>('/products').then(setProducts).catch(() => {}); }, [customer]);
  if (!customer) return <Gate />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home products={products} />} />
        <Route path="shop" element={<Shop products={products} />} />
        <Route path="cart" element={<Cart />} />
        <Route path="*" element={<Home products={products} />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <Routes>
        {/* The owner dashboard has its own separate login; customers can never open it. */}
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<CustomerSite />} />
      </Routes>
    </ShopProvider>
  );
}
