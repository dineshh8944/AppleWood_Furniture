import { useState, type FormEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, Pencil, RotateCcw, Trash2, X } from 'lucide-react';
import { downloadCsv, downloadDocx, downloadPdf } from '../../lib/export';
import { resizeImage } from '../../lib/format';
import type { Field } from './configs';
import type { View } from './useResource';

export const todayLabel = () => { const d = new Date(); return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleDateString('en-US', { weekday: 'long' })}`; };
export const money = (n: number) => 'Rs. ' + Number(n || 0).toLocaleString('en-IN');

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-sans text-xl font-bold text-navy">{title}</h1><div className="flex items-center gap-5"><span className="text-xs text-slate-500">{todayLabel()}</span>{action}</div></div>;
}
export const PrimaryBtn = (p: { children: ReactNode; onClick?: () => void }) => <button onClick={p.onClick} className="rounded-md bg-brand px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-dark">{p.children}</button>;

const BADGE: Record<string, string> = {
  'In Stock': 'bg-brand-soft text-brand', 'Low Stock': 'bg-amber-100 text-amber-800', 'Out of Stock': 'bg-red-100 text-red-700',
  New: 'bg-amber-100 text-amber-800', Contacted: 'bg-blue-100 text-blue-700', Closed: 'bg-emerald-100 text-emerald-700',
};
export const StatusBadge = ({ s }: { s: string }) => <span className={`whitespace-nowrap rounded px-2.5 py-1 text-[10px] font-semibold ${BADGE[s] ?? 'bg-slate-100 text-slate-600'}`}>{s}</span>;

export function Chips({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return <div className="flex flex-wrap gap-2">{items.map((c) => <button key={c} onClick={() => onChange(c)} className={`rounded-md px-3 py-1.5 text-[11px] font-medium ${value === c ? 'bg-brand text-white' : 'bg-white text-slate-600 hover:bg-brand-soft'}`}>{c}</button>)}</div>;
}
export const SearchBar = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) =>
  <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg bg-brand-soft/60 px-4 py-3 text-xs outline-none placeholder:text-brand/60 focus:ring-2 focus:ring-brand/30" />;

export function ExportBar({ title, head, body, file }: { title: string; head: string[]; body: string[][]; file: string }) {
  const b = 'inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-[11px] font-semibold text-navy shadow-sm hover:bg-brand-soft';
  return <div className="flex flex-wrap gap-2">
    <button className={b} onClick={() => downloadPdf(title, head, body, `${file}.pdf`)}><FileText size={13} /> PDF</button>
    <button className={b} onClick={() => downloadDocx(title, head, body, `${file}.docx`)}><Download size={13} /> Word (DOCX)</button>
    <button className={b} onClick={() => downloadCsv(head, body, `${file}.csv`)}><Download size={13} /> CSV</button>
  </div>;
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return <div className="flex items-center justify-center gap-2 py-4 text-xs">
    <button disabled={page === 1} onClick={() => onChange(page - 1)} className="disabled:opacity-30" aria-label="Previous"><ChevronLeft size={16} /></button>
    {nums.map((n, i) => <span key={n} className="flex items-center gap-2">{i > 0 && n - nums[i - 1] > 1 && <span>...</span>}<button onClick={() => onChange(n)} className={`grid h-6 min-w-6 place-items-center rounded px-1 ${n === page ? 'bg-brand font-bold text-white' : 'text-slate-600'}`}>{n}</button></span>)}
    <button disabled={page === pages} onClick={() => onChange(page + 1)} className="disabled:opacity-30" aria-label="Next"><ChevronRight size={16} /></button>
  </div>;
}

export function ViewTabs({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const t = (on: boolean) => `px-3 py-1.5 text-[11px] font-semibold ${on ? 'bg-navy text-white' : 'bg-white text-slate-600'}`;
  return <div className="inline-flex overflow-hidden rounded-md"><button className={t(view === 'active')} onClick={() => onChange('active')}>Active</button><button className={t(view === 'archived')} onClick={() => onChange('archived')}>Archived</button></div>;
}

/** Edit + Delete in the Active view; Restore + Delete forever in the Archived view. */
export function RowActions({ view, onEdit, onArchive, onRestore, onPurge }: { view: View; onEdit: () => void; onArchive: () => void; onRestore: () => void; onPurge: () => void }) {
  const b = 'grid h-7 w-7 place-items-center rounded';
  return <div className="flex items-center gap-1.5">{view === 'active'
    ? <><button className={`${b} bg-brand text-white`} onClick={onEdit} title="Edit"><Pencil size={13} /></button><button className={`${b} bg-red-50 text-red-600 hover:bg-red-100`} onClick={onArchive} title="Delete"><Trash2 size={13} /></button></>
    : <><button className={`${b} bg-brand-soft text-brand`} onClick={onRestore} title="Restore"><RotateCcw size={13} /></button><button className={`${b} bg-red-600 text-white`} onClick={onPurge} title="Delete forever"><Trash2 size={13} /></button></>}</div>;
}

export const th = 'whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold text-navy';
export const td = 'px-4 py-3 text-[11px] text-slate-700';

// ---------- add / edit form ----------
export type FormValues = Record<string, any>;
export function initialValues(fields: Field[], row?: Record<string, any>): FormValues {
  const o: FormValues = {};
  for (const f of fields) o[f.name] = row ? (f.type === 'tags' ? (row[f.name] || []).join(', ') : row[f.name] ?? '') : f.type === 'select' ? f.options![0] : f.type === 'number' ? (f.name === 'reorderLevel' ? 5 : 0) : '';
  return o;
}
export function payload(fields: Field[], v: FormValues) {
  const o: FormValues = {};
  for (const f of fields) o[f.name] = f.type === 'tags' ? String(v[f.name]).split(',').map((s) => s.trim()).filter(Boolean) : f.type === 'number' ? Number(v[f.name] || 0) : v[f.name];
  return o;
}

export function FormModal({ title, fields, initial, onSave, onClose, error }: { title: string; fields: Field[]; initial: FormValues; onSave: (body: FormValues) => Promise<boolean>; onClose: () => void; error?: string }) {
  const [v, setV] = useState<FormValues>(initial); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); if (await onSave(payload(fields, v))) onClose(); setBusy(false); }
  const inp = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-brand';
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-sans text-lg font-bold text-navy">{title}</h2><button type="button" onClick={onClose}><X size={20} /></button></div>
        <div className="grid gap-4 sm:grid-cols-2">{fields.map((f) => (
          <label key={f.name} className={`flex flex-col gap-1.5 text-[11px] font-semibold text-slate-600 ${['textarea', 'image', 'tags'].includes(f.type || '') ? 'sm:col-span-2' : ''}`}>{f.label}
            {f.type === 'select' ? <select className={inp} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })}>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>
              : f.type === 'textarea' ? <textarea className={inp} rows={3} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
              : f.type === 'image' ? <span className="grid gap-2">
                  <input type="file" accept="image/*" className="text-xs" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setV({ ...v, image: await resizeImage(file) }); }} />
                  <input className={inp} placeholder="or paste an https:// image link" value={String(v.image).startsWith('data:') ? '' : v.image} onChange={(e) => setV({ ...v, image: e.target.value })} required={!v.image} />
                  {v.image && <img src={v.image} alt="" className="h-24 w-36 rounded object-cover" />}</span>
              : <input className={inp} type={f.type === 'tags' ? 'text' : f.type || 'text'} min={f.type === 'number' ? 0 : undefined} step={f.type === 'number' ? 'any' : undefined} required={f.required} value={v[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />}
          </label>))}</div>
        {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div className="mt-6 flex gap-2"><button disabled={busy} className="rounded-md bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50">Save</button><button type="button" onClick={onClose} className="rounded-md bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-700">Cancel</button></div>
      </form>
    </div>
  );
}
