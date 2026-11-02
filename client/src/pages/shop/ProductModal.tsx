import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import Img from '../../components/Img';
import { useShop } from '../../lib/session';
import type { Product } from '../../lib/types';

const MATERIALS = ['Fabric', 'Leatherette', 'Velvet'];
export default function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add } = useShop();
  const [color, setColor] = useState(product.colors[0]);
  const [material, setMaterial] = useState(product.material);
  const pill = (on: boolean) => `border px-3 py-2 text-[11px] ${on ? 'border-forest bg-forest/10' : 'border-line'}`;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-forest/70 p-5" onClick={onClose}>
      <section className="relative grid max-h-[90vh] w-full max-w-3xl overflow-auto bg-paper md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
        <button className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center bg-paper" onClick={onClose} aria-label="Close"><X /></button>
        <Img src={product.image} category={product.category} alt={product.name} className="h-60 w-full object-cover md:h-full md:min-h-[460px]" />
        <div className="p-7 md:p-9">
          <p className="eyebrow">{product.category} collection</p>
          <h2 className="mt-3 text-3xl">{product.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">{product.description}</p>
          <p className="mt-4 text-xs text-ink/50">Price on request. Our team will share the rate when they contact you.</p>
          <p className="mt-5 text-xs font-bold">Upholstery / finish</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{[...new Set([product.material, ...MATERIALS])].map((m) => <button key={m} className={pill(material === m)} onClick={() => setMaterial(m)}>{m}</button>)}</div>
          <p className="mt-5 text-xs font-bold">Colour / polish</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{product.colors.map((c) => <button key={c} className={pill(color === c)} onClick={() => setColor(c)}>{c}</button>)}</div>
          <p className="mt-5 text-xs text-ink/50">Custom dimensions and finish options can be discussed with our team.</p>
          <button className="btn btn-dark mt-5 w-full" onClick={() => { add(product, color, material); onClose(); }}>Add to bag <ArrowRight size={16} /></button>
        </div>
      </section>
    </div>
  );
}
