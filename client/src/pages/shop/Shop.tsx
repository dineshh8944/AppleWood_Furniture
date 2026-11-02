import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import type { Product } from '../../lib/types';

const CATS = ['All Furniture', 'Sofas', 'Dining', 'Beds', 'Custom'];
export default function Shop({ products }: { products: Product[] }) {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'All Furniture';
  const [q, setQ] = useState(''); const [sort, setSort] = useState('featured'); const [open, setOpen] = useState<Product | null>(null);
  const list = useMemo(() => {
    const l = products.filter((p) => (category === 'All Furniture' || p.category === category) && `${p.name} ${p.material} ${p.type}`.toLowerCase().includes(q.toLowerCase()));
    return sort === 'az' ? [...l].sort((a, b) => a.name.localeCompare(b.name)) : l;
  }, [products, category, q, sort]);
  return (
    <main className="mx-auto max-w-[1500px] px-[7%] pb-24 pt-16">
      <p className="eyebrow">The full collection</p>
      <h1 className="mb-2 mt-4 text-5xl sm:text-6xl">Find your <em className="text-sage">forever piece.</em></h1>
      <p className="mb-10 text-sm text-ink/60">Furniture for the way you live, with options to make it yours.</p>
      <div className="flex flex-col justify-between gap-4 border-y border-line py-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">{CATS.map((c) => <button key={c} onClick={() => setParams(c === 'All Furniture' ? {} : { category: c })} className={`border px-3 py-2.5 text-[11px] ${category === c ? 'border-forest bg-forest text-white' : 'border-line text-ink/70'}`}>{c}</button>)}</div>
        <div className="flex gap-3">
          <label className="flex flex-1 items-center gap-2 border-b border-ink/20 px-1"><Search size={16} /><input className="w-full bg-transparent py-2 text-xs outline-none md:w-36" placeholder="Search furniture" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <select className="border border-line bg-transparent p-2 text-xs" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="featured">Featured</option><option value="az">Name: A to Z</option></select>
        </div>
      </div>
      <p className="my-5 text-[11px] text-ink/50">{list.length} pieces to explore</p>
      <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.id} product={p} onOpen={setOpen} />)}</div>
      {!list.length && <p className="py-14 text-center text-sm text-ink/60">No furniture found. Try another search.</p>}
      {open && <ProductModal product={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
