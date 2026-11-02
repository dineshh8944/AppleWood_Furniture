import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { ArrowRight, HelpCircle, KeyRound, LayoutGrid, LogOut, MessageSquare, Package, Settings as Cog, ShieldCheck, ShoppingBag, Users } from 'lucide-react';
import { api, errMsg } from '../../lib/api';
import Overview from './Overview';
import ResourcePage from './ResourcePage';
import Settings from './Settings';
import Help from './Help';
import InventoryPage from './InventoryPage';
import { customerCfg, enquiryCfg, loginCfg, requestCfg } from './configs';

function AdminLogin({ onDone }: { onDone: (email: string) => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setErr(''); try { const r = await api<{ email: string }>('/admin/login', { method: 'POST', body: { email, password } }); onDone(r.email); } catch (x) { setErr(errMsg(x)); } setBusy(false); }
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-5 py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm sm:p-10">
        <span className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-brand-soft text-brand"><ShieldCheck /></span>
        <p className="eyebrow">Owner access only</p>
        <h1 className="mt-3 font-sans text-3xl font-bold text-navy">Owner sign in</h1>
        <p className="mt-3 text-sm text-ink/60">Private area for the Applewood owner. Customers cannot sign in here.</p>
        <label className="label mt-6">Email<input className="input" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Owner email" /></label>
        <label className="label mt-4">Password<input className="input" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /></label>
        <button className="btn mt-6 w-full rounded-md bg-brand text-white hover:bg-brand-dark" disabled={busy}>{busy ? 'Signing in...' : 'Sign in securely'} <ArrowRight size={16} /></button>
        {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
      </form>
    </main>
  );
}

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/admin/inventory', label: 'Inventory', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { to: '/admin/logins', label: 'Login Activity', icon: KeyRound },
];

export default function AdminApp() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const navigate = useNavigate();
  useEffect(() => { api<{ email: string }>('/admin/me').then((r) => setEmail(r.email)).catch(() => setEmail(null)); }, []);
  async function signOut() { await api('/admin/logout', { method: 'POST' }).catch(() => {}); setEmail(null); navigate('/admin'); }
  if (email === undefined) return <main className="grid min-h-screen place-items-center text-sm text-ink/60">Loading...</main>;
  if (!email) return <AdminLogin onDone={setEmail} />;
  const link = ({ isActive }: { isActive: boolean }) => `flex shrink-0 items-center gap-2 whitespace-nowrap md:gap-3 rounded-md px-3 py-2.5 text-[11px] font-medium md:rounded-none md:border-r-2 ${isActive ? 'bg-brand-soft/70 text-brand md:border-brand' : 'text-navy hover:bg-mist md:border-transparent'}`;
  return (
    <div className="min-h-screen bg-mist font-sans md:grid md:grid-cols-[210px_1fr]">
      <aside className="sticky top-0 z-30 bg-white shadow-sm md:flex md:h-screen md:flex-col md:py-5 md:shadow-none">
        <div className="flex items-center justify-between px-4 py-2 md:mb-10 md:justify-start md:gap-2.5 md:py-0">
          <span className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">{email[0].toUpperCase()}</span><span className="text-[12px] font-bold text-brand">Owner</span></span>
          <button onClick={signOut} className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 md:hidden"><LogOut size={14} /> Sign out</button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:block md:space-y-1 md:overflow-visible md:p-0">
          {NAV.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={link}><Icon size={15} /> {label}</NavLink>)}
          <NavLink to="/admin/settings" className={({ isActive }) => `${link({ isActive })} md:hidden`}><Cog size={15} /> Setting</NavLink>
          <NavLink to="/admin/help" className={({ isActive }) => `${link({ isActive })} md:hidden`}><HelpCircle size={15} /> Help</NavLink>
        </nav>
        <div className="hidden md:mt-auto md:block md:space-y-1">
          <NavLink to="/admin/settings" className={link}><Cog size={15} /> Setting</NavLink>
          <NavLink to="/admin/help" className={link}><HelpCircle size={15} /> Help</NavLink>
          <button onClick={signOut} className="flex w-full items-center gap-3 border-r-2 border-transparent px-3 py-2.5 text-[11px] font-medium text-red-600"><LogOut size={15} /> Sign out</button>
          <p className="truncate px-4 pt-2 text-[10px] text-slate-400">{email}</p>
        </div>
      </aside>
      <section className="min-w-0 p-4 sm:p-7">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="orders" element={<ResourcePage key="orders" cfg={requestCfg} />} />
          <Route path="customers" element={<ResourcePage key="customers" cfg={customerCfg} />} />
          <Route path="enquiries" element={<ResourcePage key="enquiries" cfg={enquiryCfg} />} />
          <Route path="logins" element={<ResourcePage key="logins" cfg={loginCfg} />} />
          <Route path="settings" element={<Settings email={email} />} />
          <Route path="help" element={<Help />} />
          <Route path="*" element={<Overview />} />
        </Routes>
      </section>
    </div>
  );
}
