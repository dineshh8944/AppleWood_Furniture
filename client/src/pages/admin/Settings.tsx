import { useState, type FormEvent } from 'react';
import { api, errMsg } from '../../lib/api';
import { PageHeader } from './ui';

export default function Settings({ email }: { email: string }) {
  const [f, setF] = useState({ current: '', next: '' }); const [m, setM] = useState({ text: '', ok: false });
  async function submit(e: FormEvent) {
    e.preventDefault();
    try { await api('/admin/password', { method: 'POST', body: f }); setM({ text: 'Password changed.', ok: true }); setF({ current: '', next: '' }); } catch (x) { setM({ text: errMsg(x), ok: false }); }
  }
  const inp = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-brand';
  return (
    <div className="space-y-5">
      <PageHeader title="Setting" />
      <form onSubmit={submit} className="max-w-md rounded-lg bg-white p-6">
        <h2 className="font-sans text-sm font-bold text-navy">Change password</h2><p className="mb-4 mt-1 text-xs text-slate-500">Signed in as {email}. You are the only account that can open this dashboard.</p>
        <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-slate-600">Current password<input className={inp} type="password" required value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></label>
        <label className="mt-4 flex flex-col gap-1.5 text-[11px] font-semibold text-slate-600">New password (8+ characters)<input className={inp} type="password" required minLength={8} value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} /></label>
        <button className="mt-5 rounded-md bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark">Change password</button>
        {m.text && <p className={`mt-3 text-sm ${m.ok ? 'text-emerald-700' : 'text-red-700'}`}>{m.text}</p>}
      </form>
    </div>
  );
}
