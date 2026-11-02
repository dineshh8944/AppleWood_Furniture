import { ExternalLink, MapPin, Navigation } from 'lucide-react';
import { SHOP } from '../../lib/shop';

export default function Showroom() {
  return (
    <section id="visit" className="grid gap-8 bg-paper px-[7%] py-20 lg:grid-cols-[.8fr_1.2fr]">
      <div className="self-center">
        <p className="eyebrow">Visit our showroom</p>
        <h2 className="mt-3 text-4xl sm:text-5xl">Come and <em className="text-sage">sit with us.</em></h2>
        <p className="mt-4 max-w-sm text-[13px] leading-loose text-ink/60">See the fabrics, finishes and frames in person, and talk through your room with our team.</p>
        <div className="mt-7 flex gap-4 border border-line bg-white p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center bg-cream text-forest"><MapPin size={20} /></span>
          <address className="text-sm not-italic leading-relaxed text-ink">
            <strong className="block font-serif text-lg font-medium">{SHOP.name}</strong>
            {SHOP.address.map((l) => <span key={l} className="block text-ink/70">{l}</span>)}
          </address>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={SHOP.mapsLink} target="_blank" rel="noreferrer" className="btn btn-dark"><Navigation size={15} /> Get directions</a>
          <a href={SHOP.mapsLink} target="_blank" rel="noreferrer" className="btn btn-ghost"><ExternalLink size={15} /> Open in Google Maps</a>
        </div>
      </div>
      <div className="min-h-80 overflow-hidden border border-line bg-cream">
        <iframe title="Apple Wood Furnitures on Google Maps" src={SHOP.embedSrc} className="h-80 w-full border-0 lg:h-full lg:min-h-96" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
    </section>
  );
}
