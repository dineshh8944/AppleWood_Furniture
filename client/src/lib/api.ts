export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }

// Empty (same address) by default. Set VITE_API_URL only if the API is hosted on a different address.
const BASE = ((import.meta.env.VITE_API_URL as string | undefined) || '').replace(/\/$/, '');

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const r = await fetch(BASE + '/api' + path, {
    method: opts.method ?? 'GET', credentials: BASE ? 'include' : 'same-origin',
    headers: opts.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(j.error || `Request failed (${r.status})`, r.status);
  return j as T;
}
export const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');
