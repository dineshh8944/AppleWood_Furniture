import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import Img from '../../components/Img';
import { useShop } from '../../lib/session';
import type { Product } from '../../lib/types';

export default function ProductCard({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const { add } = useShop();
  const [color, setColor] = useState(product.colors[0]);
  return (
    <article>
      <button className="group relative block h-72 w-full overflow-hidden bg-cream text-left" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
        <Img src={product.image} category={product.category} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 bg-paper px-2 py-1.5 text-[9px]">{product.tag}</span>
        <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-paper"><ArrowUpRight size={16} /></span>
      </button>
      <p className="mt-4 text-[10px] text-ink/50">{product.category} / {product.type}</p>
      <button className="mt-1 text-left font-serif text-xl" onClick={() => onOpen(product)}>{product.name}</button>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <div className="flex items-center gap-1.5">
          {product.colors.map((c) => (
            <button key={c} title={c} onClick={() => setColor(c)} className={`h-3.5 w-3.5 rounded-full border border-line ${color === c ? 'outline outline-1 outline-offset-2 outline-forest' : ''}`} style={{ background: ['#d8c6a8', '#87917a', '#454846'][product.colors.indexOf(c) % 3] }} />
          ))}
          <span className="ml-1 text-[10px] text-ink/60">{color}</span>
        </div>
        <button className="flex items-center gap-1 text-[11px] font-bold text-forest" onClick={() => add(product, color)}><Plus size={14} /> Add</button>
      </div>
    </article>
  );
}
