import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Sofa } from 'lucide-react';
import Img from '../../components/Img';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import Showroom from './Showroom';
import { api, errMsg } from '../../lib/api';
import { useShop } from '../../lib/session';
import type { Product } from '../../lib/types';

const INTERESTS = ['Sofa Collections', 'Dining Tables', 'Beds & Cots', 'Custom Furniture', 'Something else'];
const u = (id: string, w = 1000) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85`;

export default function Home({ products }: { products: Product[] }) {
  const { customer } = useShop();
  const [open, setOpen] = useState<Product | null>(null);
  const [f, setF] = useState({ name: customer?.name ?? '', mobile: customer?.mobile ?? '', email: customer?.email ?? '', interest: INTERESTS[0] });
  const [agree, setAgree] = useState(false); const [sent, setSent] = useState(false); const [err, setErr] = useState('');
  async function submit(e: FormEvent) { e.preventDefault(); setErr(''); try { await api('/enquiries', { method: 'POST', body: f }); setSent(true); } catch (x) { setErr(errMsg(x)); } }
  const tiles = [
    { to: '/shop?category=Sofas', img: u('1555041469-a586c61ea9bc'), cat: 'Sofas', k: '01 - LIVING ROOM', t: 'Sofas & sectionals' },
    { to: '/shop?category=Dining', img: u('1617806118233-18e1de247200'), cat: 'Dining', k: '02 - GATHER TOGETHER', t: 'Dining tables' },
    { to: '/shop?category=Beds', img: u('1505693416388-ac5ce068fe85'), cat: 'Beds', k: '03 - REST WELL', t: 'Beds & cots' },
  ];
  return (
    <>
      <section className="grid min-h-[560px] bg-forest text-[#f7f4ec] md:grid-cols-[.9fr_1.1fr]">
        <div className="flex flex-col items-start justify-center px-[8%] py-16 md:pl-[11%]">
          <span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#c9d0c5]"><i className="h-1.5 w-1.5 rounded-full bg-[#c5aa7b]" /> FURNITURE, MADE PERSONAL</span>
          <h1 className="mt-6 text-5xl leading-[1.05] sm:text-7xl">Make room for<br /><em className="text-[#b8c5b5]">better living.</em></h1>
          <p className="mt-5 max-w-sm text-[13px] leading-loose text-[#d0d6ce]">Thoughtfully crafted furniture, timeless materials, and the freedom to make every piece your own.</p>
          <div className="mt-6 flex flex-wrap items-center gap-6"><Link to="/shop" className="btn btn-light">Explore collection <ArrowRight size={16} /></Link><a href="#craft" className="flex items-center gap-2 text-[11px] font-bold">Discover our craft <ArrowUpRight size={15} /></a></div>
        </div>
        <div className="relative min-h-[320px]"><Img src={u('1600210492486-724fe5c67fb0', 1600)} alt="Warm, modern living room" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" /><div className="absolute bottom-9 left-9 text-white"><span className="text-[9px] tracking-[0.2em]">01 / THE LIVING EDIT</span><p className="mt-2 font-serif text-2xl">Comfort that feels like home.</p></div></div>
      </section>

      <section id="collections" className="px-[7%] py-20">
        <div className="mb-8 flex items-end justify-between gap-4"><div><p className="eyebrow">Find your feel</p><h2 className="mt-3 text-4xl sm:text-5xl">Spaces with <em className="text-sage">character.</em></h2></div><Link to="/shop" className="hidden items-center gap-2 text-[11px] font-bold sm:flex">Shop all furniture <ArrowRight size={16} /></Link></div>
        <div className="grid gap-4 md:grid-cols-3">{tiles.map((t) => (
          <Link key={t.to} to={t.to} className="group relative block min-h-80 overflow-hidden bg-cream text-white">
            <Img src={t.img} category={t.cat} alt={t.t} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6"><span className="text-[9px] tracking-[0.16em]">{t.k}</span><h3 className="my-3 text-3xl">{t.t}</h3><b className="flex items-center gap-2 text-[10px]">Explore <ArrowUpRight size={15} /></b></div>
          </Link>))}</div>
      </section>

      <section className="px-[7%] pb-20">
        <div className="mb-8"><p className="eyebrow">The customer favourites</p><h2 className="mt-3 text-4xl sm:text-5xl">Pieces to live <em className="text-sage">with.</em></h2></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} onOpen={setOpen} />)}</div>
      </section>

      <section id="craft" className="grid bg-[#f0eee7] md:grid-cols-2">
        <Img src={u('1600566753086-00f18fb6b3ea', 1400)} alt="Natural textures and handcrafted interior" className="h-80 w-full object-cover md:h-full" />
        <div className="self-center px-[10%] py-16">
          <p className="eyebrow">The Applewood approach</p><h2 className="mt-4 text-4xl sm:text-5xl">Good design.<br /><em className="text-sage">Honest materials.</em></h2>
          <p className="mt-5 max-w-md text-[13px] leading-loose text-ink/60">Choose upholstery that suits your life, finishes that complement your space, and layouts that work for your room. Customisation is at the heart of how we sell furniture.</p>
        </div>
      </section>

      <section id="enquiry" className="grid gap-10 bg-forest px-[8%] py-20 lg:grid-cols-[.8fr_1.2fr]">
        <div className="pt-4 text-[#f8f5ee]"><p className="text-[10px] font-bold tracking-[0.2em] text-[#c9d0c5]">LET'S TALK FURNITURE</p><h2 className="my-5 text-5xl sm:text-6xl">Your space.<br /><em className="text-[#b8c5b5]">Your choices.</em></h2><p className="max-w-sm text-[13px] leading-loose text-[#c9d0c5]">Tell us what you're looking for. Our team can help you explore styles, materials, colours and custom options.</p><div className="mt-10 flex items-center gap-4"><span className="grid h-11 w-11 place-items-center border border-[#647266]"><Sofa size={20} /></span><div><strong className="text-xs">Made personal, from the start.</strong><p className="text-[11px] text-[#bdc7bc]">Share your interests and we'll have a starting point for your conversation.</p></div></div></div>
        <form onSubmit={submit} className="self-center bg-paper p-8 text-ink">
          <p className="eyebrow">Showroom enquiry</p><h3 className="mb-6 mt-2 text-3xl">How can we help?</h3>
          {sent ? (
            <div className="py-6 text-center"><span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#e4ebdf]"><Check /></span><h3 className="text-2xl">Thank you for your interest.</h3><p className="my-3 text-sm text-ink/60">Our team will contact you shortly on your mobile number.</p><button type="button" className="btn btn-dark" onClick={() => { setSent(false); setAgree(false); }}>Send another enquiry</button></div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="label">Your name<input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
                <label className="label">Mobile number<input className="input" required pattern="[0-9 +\(\)\-]{10,16}" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} /></label>
                <label className="label">Email address<input className="input" type="email" placeholder="you@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
                <label className="label">Interested in<select className="input" value={f.interest} onChange={(e) => setF({ ...f, interest: e.target.value })}>{INTERESTS.map((i) => <option key={i}>{i}</option>)}</select></label>
              </div>
              <label className="my-5 flex items-center gap-2 text-xs text-ink/60"><input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-forest" /> I agree to be contacted about this furniture enquiry.</label>
              <button className="btn btn-dark w-full">Submit enquiry <ArrowRight size={16} /></button>
              {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
              <p className="mt-3 text-center text-[10px] text-ink/50">Your details are visible only to authorised Applewood staff.</p>
            </>
          )}
        </form>
      </section>
      <Showroom />
      {open && <ProductModal product={open} onClose={() => setOpen(null)} />}
    </>
  );
}
