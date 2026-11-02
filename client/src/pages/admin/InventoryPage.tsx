import { Fragment, useMemo, useState } from 'react';
import Img from '../../components/Img';
import { CATEGORIES, type AdminProduct } from '../../lib/types';
import { useResource } from './useResource';
import { productFields } from './configs';
import { Chips, ExportBar, FormModal, PageHeader, Pagination, PrimaryBtn, RowActions, SearchBar, StatusBadge, ViewTabs, initialValues, money, td, th } from './ui';

const PAGE = 8;
const stockStatus = (p: AdminProduct) => (p.stock <= 0 ? 'Out of Stock' : p.stock <= p.reorderLevel ? 'Low Stock' : 'In Stock');
const margin = (p: AdminProduct) => (p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) + '%' : '-');
const TABS = ['All Items', 'New Items', 'Top Items', 'Low Stocks', 'Out of Stocks'];

export default function InventoryPage() {
  const r = useResource<AdminProduct>('products');
  const [cat, setCat] = useState('All Items'); const [q, setQ] = useState(''); const [tab, setTab] = useState('All Items'); const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ id: number | null; values: Record<string, any> } | null>(null);

  const lowItems = useMemo(() => r.rows.filter((p) => stockStatus(p) !== 'In Stock'), [r.rows]);
  const list = useMemo(() => {
    const week = Date.now() - 7 * 86400_000;
    let l = r.rows.filter((p) => (cat === 'All Items' || p.category === cat) && `${p.name} ${p.sku} ${p.category} ${p.type}`.toLowerCase().includes(q.toLowerCase()));
    if (tab === 'New Items') l = l.filter((p) => new Date(p.createdAt).getTime() > week);
    if (tab === 'Top Items') l = l.filter((p) => p.ordered > 0).sort((a, b) => b.ordered - a.ordered);
    if (tab === 'Low Stocks') l = l.filter((p) => stockStatus(p) === 'Low Stock');
    if (tab === 'Out of Stocks') l = l.filter((p) => stockStatus(p) === 'Out of Stock');
    return l;
  }, [r.rows, cat, q, tab]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE)); const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PAGE, cur * PAGE);
  const head = ['Product', 'Category', 'SKU No', 'Stock', 'Cost', 'Price', 'Margin', 'Status', 'Type'];
  const body = list.map((p) => [p.name, p.category, p.sku, String(p.stock), money(p.cost), money(p.price), margin(p), stockStatus(p), p.grade]);

  return (
    <div className="space-y-5">
      <PageHeader title="Inventory" action={<PrimaryBtn onClick={() => setForm({ id: null, values: initialValues(productFields) })}>Add New Items</PrimaryBtn>} />
      <Chips items={['All Items', ...CATEGORIES]} value={cat} onChange={(c) => { setCat(c); setPage(1); }} />
      <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search for inventory items" />

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="font-sans text-sm font-bold text-navy">Low Stock Items</h2><button className="text-[11px] font-medium text-brand" onClick={() => { setTab('Low Stocks'); setPage(1); }}>Show all</button></div>
        {lowItems.length === 0 ? <p className="text-xs text-slate-500">Nothing is running low. Good job!</p> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">{lowItems.slice(0, 8).map((p) => (
            <button key={p.id} className="text-left" onClick={() => setForm({ id: p.id, values: initialValues(productFields, p) })}>
              <Img src={p.image} category={p.category} alt={p.name} className="h-20 w-full rounded-md object-cover" />
              <p className="mt-1.5 truncate text-[11px] font-semibold text-navy">{p.name}</p>
              <p className={`text-[10px] ${p.stock <= 0 ? 'text-red-600' : 'text-brand'}`}>{p.stock <= 0 ? 'Out of stock' : `${p.stock} left`}</p>
            </button>))}</div>)}
      </section>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
          <div className="flex flex-wrap">{TABS.map((t) => <button key={t} onClick={() => { setTab(t); setPage(1); }} className={`px-4 py-2.5 text-[11px] font-semibold ${tab === t ? 'border-b-2 border-brand text-navy' : 'text-slate-500'}`}>{t}</button>)}</div>
          <div className="flex flex-wrap items-center gap-2 pb-2"><ViewTabs view={r.view} onChange={(v) => { r.setView(v); setPage(1); }} /><ExportBar title={`Inventory${r.view === 'archived' ? ' (archived)' : ''}`} head={head} body={body} file="inventory" /></div>
        </div>
        {r.msg && <p className="mt-3 text-sm text-red-700">{r.msg}</p>}
        <div className="mt-3 rounded-lg bg-white">
          {/* Desktop / tablet: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100">{head.map((h) => <th key={h} className={th}>{h}</th>)}<th className={th} /></tr></thead>
              <tbody>{shown.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className={td}><div className="flex items-center gap-3"><Img src={p.image} category={p.category} alt="" className="h-9 w-9 rounded-full object-cover" /><span className="font-medium text-navy">{p.name}</span></div></td>
                  <td className={td}>{p.category}</td><td className={td}>{p.sku || '-'}</td><td className={td}>{p.stock}</td>
                  <td className={td}><span className="rounded bg-brand-soft px-2 py-1 font-semibold text-navy">{money(p.cost)}</span></td><td className={`${td} text-brand`}>{money(p.price)}</td>
                  <td className={td}>{margin(p)}</td><td className={td}><StatusBadge s={stockStatus(p)} /></td>
                  <td className={td}><span className="rounded bg-brand-soft px-2 py-1 font-semibold text-navy">{p.grade || '-'}</span></td>
                  <td className={td}><RowActions view={r.view} onEdit={() => setForm({ id: p.id, values: initialValues(productFields, p) })} onArchive={() => r.archive(p.id)} onRestore={() => r.restore(p.id)} onPurge={() => r.purge(p.id)} /></td>
                </tr>))}</tbody>
            </table>
          </div>
          {/* Phone: one card per item */}
          <div className="divide-y divide-slate-100 md:hidden">{shown.map((p) => (
            <div key={p.id} className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <Img src={p.image} category={p.category} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-navy">{p.name}</p><div className="mt-1 flex items-center gap-2"><StatusBadge s={stockStatus(p)} /><span className="text-[10px] text-slate-500">{p.category}</span></div></div>
                <RowActions view={r.view} onEdit={() => setForm({ id: p.id, values: initialValues(productFields, p) })} onArchive={() => r.archive(p.id)} onRestore={() => r.restore(p.id)} onPurge={() => r.purge(p.id)} />
              </div>
              <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5 text-[11px]">
                {([['SKU No', p.sku || '-'], ['Stock', String(p.stock)], ['Cost', money(p.cost)], ['Price', money(p.price)], ['Margin', margin(p)], ['Type', p.grade || '-']] as const).map(([k, v]) => <Fragment key={k}><dt className="text-slate-400">{k}</dt><dd className="text-slate-700">{v}</dd></Fragment>)}
              </dl>
            </div>))}</div>
          {!shown.length && <p className="p-8 text-center text-xs text-slate-500">{r.loading ? 'Loading...' : 'No items found.'}</p>}
          <Pagination page={cur} pages={pages} onChange={setPage} />
        </div>
        <p className="mt-2 text-[10px] text-slate-500">{list.length} item(s). Prices, cost and stock are visible to the owner only, never on the customer website.</p>
      </div>
      {form && <FormModal title={form.id ? 'Edit item' : 'Add new item'} fields={productFields} initial={form.values} onSave={(b) => r.save(form.id, b)} onClose={() => { setForm(null); r.setMsg(''); }} error={r.msg} />}
    </div>
  );
}
