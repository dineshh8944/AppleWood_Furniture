export const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).replace(/[  ]/g, ' ') : '-';

const readJson = <T,>(k: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T; } catch { return fallback; } };
const writeJson = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
export const store = { read: readJson, write: writeJson, remove: (k: string) => { try { localStorage.removeItem(k); } catch { /* ignore */ } } };

export function resizeImage(file: File, max = 800): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.8));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  });
}
