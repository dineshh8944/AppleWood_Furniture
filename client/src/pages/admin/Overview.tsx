import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errMsg } from '../../lib/api';
import { fmtDate } from '../../lib/format';
import type { Stats } from '../../lib/types';
import { PageHeader } from './ui';

export default function Overview() {
  const [s, setS] = useState<Stats | null>(null); const [err, setErr] = useState('');
  useEffect(() => { api<Stats>('/admin/stats').then(setS).catch((e) => setErr(errMsg(e))); }, []);
  if (err) return <p className="text-sm text-red-700">{err}</p>;
  if (!s) return <p className="text-sm text-slate-500">Loading...</p>;
  const cards: [string, number, string][] = [['Customers', s.totals.customers, '/admin/customers'], ['Logins today', s.totals.loginsToday, '/admin/logins'], ['All logins', s.totals.logins, '/admin/logins'], ['Enquiries', s.totals.enquiries, '/admin/enquiries'], ['Orders', s.totals.requests, '/admin/orders'], ['Products', s.totals.products, '/admin/inventory'], ['Low stock', s.totals.lowStock, '/admin/inventory'], ['Out of stock', s.totals.outOfStock, '/admin/inventory']];
  const max = Math.max(1, ...s.loginsPerDay.map((d) => d.logins));
  const status = (t: string, c: Record<string, number>) => <div className="rounded-lg bg-white p-5"><p className="text-xs font-bold text-navy">{t}</p><div className="mt-3 flex gap-8">{Object.entries(c).map(([k, v]) => <div key={k}><p className="text-3xl font-bold text-brand">{v}</p><p className="text-[10px] text-slate-500">{k}</p></div>)}</div></div>;
  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{cards.map(([l, v, to]) => <Link to={to} key={l} className="rounded-lg bg-white p-4 hover:ring-2 hover:ring-brand/30"><p className="text-[11px] text-slate-500">{l}</p><p className="mt-2 text-3xl font-bold text-navy">{v}</p></Link>)}</div>
      <div className="grid gap-3 lg:grid-cols-2">{status('Enquiry status', s.enquiryStatus)}{status('Order status', s.requestStatus)}</div>
      <div className="rounded-lg bg-white p-5">
        <p className="text-xs font-bold text-navy">Customer logins, last 14 days</p>
        <div className="mt-4 flex h-36 items-end gap-1.5">{s.loginsPerDay.map((d) => <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${d.logins}`}><span className="text-[9px] text-slate-500">{d.logins || ''}</span><div className="w-full rounded-t bg-brand" style={{ height: `${(d.logins / max) * 100}%`, minHeight: d.logins ? 4 : 1 }} /><span className="text-[8px] text-slate-400">{d.date.slice(8)}</span></div>)}</div>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <List title="Recent logins" to="/admin/logins" items={s.recentLogins.map((r) => [r.name, `${r.mobile} · ${fmtDate(r.at)}`])} />
        <List title="Recent enquiries" to="/admin/enquiries" items={s.recentEnquiries.map((r) => [r.name, `${r.interest} · ${r.status}`])} />
        <List title="Recent orders" to="/admin/orders" items={s.recentRequests.map((r) => [r.name, `${r.items.length} item(s) · ${r.status}`])} />
      </div>
    </div>
  );
}
function List({ title, to, items }: { title: string; to: string; items: string[][] }) {
  return <div className="rounded-lg bg-white p-5"><div className="flex justify-between"><p className="text-xs font-bold text-navy">{title}</p><Link to={to} className="text-[11px] font-medium text-brand">View all</Link></div>
    <ul className="mt-3 divide-y divide-slate-100">{items.map(([a, b], i) => <li key={i} className="py-2 text-xs"><strong className="text-navy">{a}</strong><br /><span className="text-slate-500">{b}</span></li>)}{!items.length && <li className="py-3 text-xs text-slate-500">Nothing yet.</li>}</ul></div>;
}
