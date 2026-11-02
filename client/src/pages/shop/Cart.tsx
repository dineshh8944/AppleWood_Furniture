import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import Img from '../../components/Img';
import { api, errMsg } from '../../lib/api';
import { useShop } from '../../lib/session';

export default function Cart() {
  const { cart, customer, setQty, remove, clear, count } = useShop();
  const [address, setAddress] = useState(''); const [err, setErr] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  async function order() {
    setBusy(true); setErr('');
    try { await api('/requests', { method: 'POST', body: { name: customer!.name, mobile: customer!.mobile, address, items: cart.map((i) => ({ id: i.id, color: i.color, material: i.material, quantity: i.quantity })) } }); clear(); setDone(true); }
    catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  }
  if (done) return <main className="px-[7%] py-24 text-center"><span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#e4ebdf]"><Check /></span><h1 className="text-4xl">Order request sent.</h1><p className="my-3 text-sm text-ink/60">Our team will contact you on {customer?.mobile} to confirm price, customisation and delivery.</p><Link to="/shop" className="btn btn-dark mt-3">Continue browsing</Link></main>;
  return (
    <main className="mx-auto max-w-[1500px] px-[7%] pb-24 pt-16">
      <p className="eyebrow">Your selection</p><h1 className="mb-10 mt-4 text-5xl sm:text-6xl">Your <em className="text-sage">shopping bag.</em></h1>
      {!cart.length ? (
        <div className="py-12 text-center text-ink/60"><ShoppingBag className="mx-auto" /><h3 className="my-4 font-serif text-2xl text-ink">Your bag is waiting for something lovely.</h3><Link to="/shop" className="btn btn-dark">Explore furniture <ArrowRight size={16} /></Link></div>
      ) : (
        <div className="grid items-start gap-10 lg:grid-cols-[1.6fr_.8fr]">
          <div className="border-t border-line">{cart.map((i) => (
            <article key={i.key} className="grid grid-cols-[90px_1fr] gap-4 border-b border-line py-5 sm:grid-cols-[125px_1fr]">
              <Img src={i.image} category={i.category} alt={i.name} className="h-24 w-full object-cover sm:h-28" />
              <div><p className="eyebrow">{i.category} · {i.material}</p><h3 className="my-2 text-xl">{i.name}</h3><p className="text-[11px] text-ink/60">Finish: {i.color}</p>
                <div className="mt-3 flex items-center gap-4"><div className="flex items-center gap-3 border border-line px-2 py-1"><button onClick={() => setQty(i.key, i.quantity - 1)} aria-label="Less"><Minus size={14} /></button><span className="text-xs">{i.quantity}</span><button onClick={() => setQty(i.key, i.quantity + 1)} aria-label="More"><Plus size={14} /></button></div><button className="text-[11px] text-ink/50 underline" onClick={() => remove(i.key)}>Remove</button></div></div>
            </article>))}</div>
          <aside className="bg-[#f0eee7] p-6">
            <p className="eyebrow">Order summary</p><h3 className="mb-5 mt-3 text-3xl">Almost yours.</h3>
            <div className="flex justify-between border-b border-line py-3 text-xs"><span>Items</span><strong>{count}</strong></div>
            <div className="flex justify-between border-b border-line py-3 text-xs"><span>Price &amp; delivery</span><span className="text-ink/60">Confirmed by showroom</span></div>
            <p className="my-4 text-[11px] leading-relaxed text-ink/60">Final price, customisation and delivery details will be confirmed by our team.</p>
            <p className="text-sm font-bold">{customer?.name}</p><p className="mb-3 text-sm text-ink/60">{customer?.mobile}</p>
            <textarea className="input" rows={3} placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <button className="btn btn-dark mt-4 w-full" disabled={busy || address.trim().length < 5} onClick={order}>{busy ? 'Sending...' : 'Request order'} <ArrowRight size={16} /></button>
            {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
          </aside>
        </div>
      )}
    </main>
  );
}
