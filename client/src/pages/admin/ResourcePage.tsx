import { Fragment, useEffect, useState } from 'react';
import { Chips, ExportBar, FormModal, PageHeader, Pagination, PrimaryBtn, RowActions, SearchBar, ViewTabs, initialValues, td, th } from './ui';
import { useResource } from './useResource';
import type { Cfg } from './configs';

type Row = { id: number; mobile?: string; status?: string; [k: string]: any };
const PAGE = 10;

export default function ResourcePage<T extends { id: number }>({ cfg }: { cfg: Cfg<T> }) {
  const r = useResource<Row>(cfg.endpoint);
  const [q, setQ] = useState(''); const [status, setStatus] = useState('All'); const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ id: number | null; values: Record<string, any> } | null>(null);
  useEffect(() => { setPage(1); }, [q, status, r.view]);

  const list = r.rows.filter((x) => (status === 'All' || x.status === status) && JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
  const pages = Math.max(1, Math.ceil(list.length / PAGE)); const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PAGE, cur * PAGE);
  const head = cfg.columns.map((c) => c.label);
  const body = list.map((x) => cfg.columns.map((c) => c.text(x as unknown as T)));

  return (
    <div className="space-y-5">
      <PageHeader title={cfg.title} action={!cfg.readOnly && <PrimaryBtn onClick={() => setForm({ id: null, values: initialValues(cfg.fields) })}>{cfg.addLabel}</PrimaryBtn>} />
      <p className="-mt-3 text-xs text-slate-500">{cfg.hint}</p>
      {cfg.statusFilter && <Chips items={['All', 'New', 'Contacted', 'Closed']} value={status} onChange={setStatus} />}
      <SearchBar value={q} onChange={setQ} placeholder={`Search ${cfg.title.toLowerCase()}`} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        {cfg.readOnly ? <span /> : <ViewTabs view={r.view} onChange={r.setView} />}
        <ExportBar title={cfg.title + (r.view === 'archived' ? ' (archived)' : '')} head={head} body={body} file={cfg.file} />
      </div>
      {r.msg && <p className="text-sm text-red-700">{r.msg}</p>}
      <div className="rounded-lg bg-white">
        {/* Desktop / tablet: table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">{cfg.columns.map((c) => <th key={c.label} className={th}>{c.label}</th>)}{cfg.contact && <th className={th}>Contact</th>}{!cfg.readOnly && <th className={th} />}</tr></thead>
            <tbody>{shown.map((x) => (
              <tr key={x.id} className="border-b border-slate-100 align-top last:border-0">
                {cfg.columns.map((c) => <td key={c.label} className={`${td} max-w-xs`}>{c.cell ? c.cell(x as unknown as T) : c.text(x as unknown as T)}</td>)}
                {cfg.contact && <td className={`${td} whitespace-nowrap`}><a className="font-semibold text-brand" href={`tel:+91${x.mobile}`}>Call</a> · <a className="font-semibold text-brand" href={`https://wa.me/91${x.mobile}`} target="_blank" rel="noreferrer">WhatsApp</a></td>}
                {!cfg.readOnly && <td className={td}><RowActions view={r.view} onEdit={() => setForm({ id: x.id, values: initialValues(cfg.fields, x) })} onArchive={() => r.archive(x.id)} onRestore={() => r.restore(x.id)} onPurge={() => r.purge(x.id)} /></td>}
              </tr>))}</tbody>
          </table>
        </div>
        {/* Phone: one card per record */}
        <div className="divide-y divide-slate-100 md:hidden">{shown.map((x) => (
          <div key={x.id} className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 break-words text-sm font-semibold text-navy">{cfg.columns[0].cell ? cfg.columns[0].cell(x as unknown as T) : cfg.columns[0].text(x as unknown as T)}</div>
              {!cfg.readOnly && <RowActions view={r.view} onEdit={() => setForm({ id: x.id, values: initialValues(cfg.fields, x) })} onArchive={() => r.archive(x.id)} onRestore={() => r.restore(x.id)} onPurge={() => r.purge(x.id)} />}
            </div>
            <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-1.5 text-[11px]">
              {cfg.columns.slice(1).map((c) => <Fragment key={c.label}><dt className="text-slate-400">{c.label}</dt><dd className="min-w-0 break-words text-slate-700">{(c.cell ? c.cell(x as unknown as T) : c.text(x as unknown as T)) || '-'}</dd></Fragment>)}
            </dl>
            {cfg.contact && <div className="flex gap-4 pt-1 text-[11px] font-semibold text-brand"><a href={`tel:+91${x.mobile}`}>Call</a><a href={`https://wa.me/91${x.mobile}`} target="_blank" rel="noreferrer">WhatsApp</a></div>}
          </div>))}</div>
        {!shown.length && <p className="p-8 text-center text-xs text-slate-500">{r.loading ? 'Loading...' : 'No records.'}</p>}
        <Pagination page={cur} pages={pages} onChange={setPage} />
      </div>
      <p className="text-[10px] text-slate-500">{list.length} record(s)</p>
      {form && <FormModal title={`${form.id ? 'Edit' : 'Add'} ${cfg.title.replace(/s$/, '').toLowerCase()}`} fields={cfg.fields} initial={form.values} onSave={(b) => r.save(form.id, b)} onClose={() => { setForm(null); r.setMsg(''); }} error={r.msg} />}
    </div>
  );
}
