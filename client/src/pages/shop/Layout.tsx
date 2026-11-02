import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag } from 'lucide-react';
import { useShop } from '../../lib/session';
import { SHOP } from '../../lib/shop';

export default function Layout() {
  const { customer, logout, count } = useShop();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const link = ({ isActive }: { isActive: boolean }) => (isActive ? 'text-forest' : 'text-ink/60 hover:text-forest');
  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-ink/10 bg-paper px-[5%]">
        <Link to="/" className="flex items-center gap-3 text-[13px] font-bold leading-tight tracking-[0.18em]">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-sage/60 font-serif text-2xl font-medium tracking-normal text-forest">A</span>
          <span>APPLEWOOD<small className="mt-1 block text-[9px] font-medium tracking-[0.4em]">FURNITURES</small></span>
        </Link>
        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-20 flex-col gap-5 border-b border-line bg-paper px-[6%] py-5 text-xs md:static md:flex md:flex-row md:gap-8 md:border-0 md:p-0`} onClick={() => setOpen(false)}>
          <NavLink to="/shop" className={link}>Shop all</NavLink>
          <a href={pathname === '/' ? '#collections' : '/#collections'} className="text-ink/60 hover:text-forest">Collections</a>
          <a href={pathname === '/' ? '#craft' : '/#craft'} className="text-ink/60 hover:text-forest">Our craft</a>
          <a href={pathname === '/' ? '#enquiry' : '/#enquiry'} className="text-ink/60 hover:text-forest">Contact</a>
          <a href={pathname === '/' ? '#visit' : '/#visit'} className="text-ink/60 hover:text-forest">Visit us</a>
        </nav>
        <div className="flex items-center gap-5 text-xs">
          <button className="text-ink/60" onClick={logout}><span className="hidden sm:inline">Hi, {customer?.name.split(' ')[0]} · </span>Sign out</button>
          <Link to="/admin" className="hidden rounded border border-forest/30 px-2.5 py-1.5 text-[11px] font-semibold text-forest hover:bg-forest hover:text-white sm:block">Owner login</Link>
          <Link to="/cart" className="flex items-center gap-2" aria-label="Shopping bag"><ShoppingBag size={18} /><span className="hidden sm:inline">Bag</span><b className="grid h-5 min-w-5 place-items-center rounded-full bg-forest text-[10px] text-white">{count}</b></Link>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu"><Menu size={22} /></button>
        </div>
      </header>
      <Outlet />
      <footer className="bg-[#eeece5] px-[7%] pb-5 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-8"><p className="font-serif text-lg text-forest/80">Furniture, made personal.</p><a href={SHOP.mapsLink} target="_blank" rel="noreferrer" className="max-w-xs text-xs leading-relaxed text-ink/60 hover:text-forest">{SHOP.name}, {SHOP.address.join(' ')}</a></div>
        <div className="flex flex-wrap justify-between gap-3 pt-4 text-[10px] text-ink/50"><span>© {new Date().getFullYear()} Apple Wood Furnitures</span><Link to="/admin" className="hover:text-forest">Owner login</Link></div>
      </footer>
    </>
  );
}
