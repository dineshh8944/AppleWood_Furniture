import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../../lib/session';
import { errMsg } from '../../lib/api';

export default function Gate() {
  const { login } = useShop();
  const [f, setF] = useState({ name: '', mobile: '', email: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setErr(''); try { await login(f); } catch (x) { setErr(errMsg(x)); } setBusy(false); }
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-forest lg:grid-cols-2">
      {/* Photo background (replace client/public/login-bg.jpg to change it) */}
      <img src="/login-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-forest/85 via-forest/55 to-black/45" />

      <section className="relative hidden flex-col justify-between p-12 text-white lg:flex">
        <span className="flex items-center gap-3 text-[13px] font-bold tracking-[0.18em]"><span className="grid h-10 w-10 place-items-center rounded-full border border-white/50 font-serif text-2xl font-medium tracking-normal">A</span>APPLEWOOD FURNITURES</span>
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-white/70">FURNITURE, MADE PERSONAL</p>
          <h2 className="mt-4 max-w-md text-6xl leading-[1.05]">Make room for <em className="text-[#c7d4c3]">better living.</em></h2>
          <p className="mt-5 max-w-sm text-sm leading-loose text-white/80">Sofas, dining sets and beds crafted with honest materials, and the freedom to make every piece your own.</p>
        </div>
        <p className="text-xs text-white/60">Service Rd, T K Reddy Layout, Banaswadi, Bengaluru</p>
      </section>

      <section className="relative grid place-items-center px-5 py-10">
        <form onSubmit={submit} className="w-full max-w-md bg-paper/95 p-8 shadow-2xl backdrop-blur sm:p-10">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-sage/60 font-serif text-3xl text-forest">A</span>
          <p className="eyebrow mt-5">Applewood Furnitures</p>
          <h1 className="mt-3 text-4xl text-forest">Welcome <em className="text-sage">home.</em></h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">Please enter your name and mobile number to view our furniture collection.</p>
          <label className="label mt-6">Full name<input className="input" required minLength={2} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name" /></label>
          <label className="label mt-4">Mobile number<input className="input" required type="tel" inputMode="tel" pattern="[0-9 +\(\)\-]{10,16}" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} placeholder="98765 43210" /></label>
          <label className="label mt-4">Email (optional)<input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@example.com" /></label>
          <button className="btn btn-dark mt-6 w-full" disabled={busy}>{busy ? 'Please wait...' : 'View website'} <ArrowRight size={16} /></button>
          {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
          <p className="mt-5 text-xs text-ink/50">Your details are shared only with the Applewood team.</p>
          <p className="mt-3 border-t border-line pt-3 text-xs"><Link to="/admin" className="font-semibold text-forest underline">Owner login</Link> <span className="text-ink/50">(shop owner only)</span></p>
        </form>
      </section>
    </main>
  );
}
