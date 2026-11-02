import { useCallback, useEffect, useState } from 'react';
import { api, errMsg } from '../../lib/api';

export type View = 'active' | 'archived';

/** Loads one collection from the API and gives create / update / archive / restore / delete-forever. */
export function useResource<T extends { id: number }>(endpoint: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [view, setView] = useState<View>('active');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await api<T[]>(`/admin/${endpoint}${view === 'archived' ? '?archived=1' : ''}`)); setMsg(''); } catch (e) { setMsg(errMsg(e)); }
    setLoading(false);
  }, [endpoint, view]);
  useEffect(() => { void load(); }, [load]);

  const run = async (fn: () => Promise<unknown>) => { try { await fn(); await load(); return true; } catch (e) { setMsg(errMsg(e)); return false; } };
  return {
    rows, view, setView, loading, msg, setMsg, reload: load,
    save: (id: number | null, body: unknown) => run(() => api(`/admin/${endpoint}${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body })),
    archive: (id: number) => (window.confirm('Delete this record? It moves to the Archived tab and can be restored.') ? run(() => api(`/admin/${endpoint}/${id}`, { method: 'DELETE' })) : Promise.resolve(false)),
    restore: (id: number) => run(() => api(`/admin/${endpoint}/${id}/restore`, { method: 'POST' })),
    purge: (id: number) => (window.confirm('DELETE FOREVER? This permanently erases the record and cannot be undone.') ? run(() => api(`/admin/${endpoint}/${id}?permanent=1`, { method: 'DELETE' })) : Promise.resolve(false)),
  };
}
