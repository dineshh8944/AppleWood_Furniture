import type { ImgHTMLAttributes } from 'react';

const FRAME = (body: string) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#eeece6"/>` +
  `<ellipse cx="400" cy="470" rx="290" ry="26" fill="#000" opacity=".07"/>${body}` +
  `<text x="400" y="560" font-family="Georgia,serif" font-size="22" fill="#8a9a88" text-anchor="middle">Applewood Furnitures</text></svg>`,
);

const sofa = `<rect x="170" y="240" width="460" height="150" rx="34" fill="#4f6b5a"/><rect x="150" y="330" width="500" height="100" rx="24" fill="#6f8c78"/>
<rect x="190" y="300" width="205" height="70" rx="16" fill="#7d9a86"/><rect x="405" y="300" width="205" height="70" rx="16" fill="#7d9a86"/>
<rect x="110" y="290" width="70" height="150" rx="28" fill="#3f5a4a"/><rect x="620" y="290" width="70" height="150" rx="28" fill="#3f5a4a"/>
<rect x="150" y="436" width="14" height="30" rx="4" fill="#8a5a30"/><rect x="636" y="436" width="14" height="30" rx="4" fill="#8a5a30"/>`;
const dining = `<rect x="200" y="290" width="400" height="28" rx="8" fill="#b98e5a"/><rect x="232" y="318" width="20" height="140" rx="4" fill="#8a6a45"/><rect x="548" y="318" width="20" height="140" rx="4" fill="#8a6a45"/>
<rect x="104" y="300" width="16" height="90" rx="5" fill="#8a6a45"/><rect x="104" y="378" width="84" height="16" rx="5" fill="#a07a50"/><rect x="108" y="394" width="12" height="64" rx="3" fill="#8a6a45"/><rect x="172" y="394" width="12" height="64" rx="3" fill="#8a6a45"/>
<rect x="680" y="300" width="16" height="90" rx="5" fill="#8a6a45"/><rect x="612" y="378" width="84" height="16" rx="5" fill="#a07a50"/><rect x="616" y="394" width="12" height="64" rx="3" fill="#8a6a45"/><rect x="680" y="394" width="12" height="64" rx="3" fill="#8a6a45"/>`;
const bed = `<rect x="160" y="200" width="480" height="190" rx="16" fill="#8a6a45"/><rect x="140" y="350" width="520" height="90" rx="12" fill="#f4f1ea"/>
<rect x="190" y="310" width="190" height="60" rx="26" fill="#ffffff"/><rect x="420" y="310" width="190" height="60" rx="26" fill="#ffffff"/>
<rect x="140" y="385" width="520" height="62" rx="12" fill="#6f8c78"/><rect x="140" y="440" width="22" height="26" rx="4" fill="#6b4f30"/><rect x="638" y="440" width="22" height="26" rx="4" fill="#6b4f30"/>`;
const armchair = `<rect x="260" y="230" width="190" height="170" rx="34" fill="#4f6b5a"/><rect x="240" y="330" width="230" height="90" rx="22" fill="#6f8c78"/>
<rect x="210" y="300" width="56" height="130" rx="24" fill="#3f5a4a"/><rect x="444" y="300" width="56" height="130" rx="24" fill="#3f5a4a"/>
<rect x="250" y="426" width="12" height="40" rx="3" fill="#8a5a30"/><rect x="448" y="426" width="12" height="40" rx="3" fill="#8a5a30"/>
<rect x="590" y="190" width="10" height="270" rx="4" fill="#8a6a45"/><path d="M545 190 L645 190 L625 130 L565 130 Z" fill="#e7d8b4"/>`;

const ART: Record<string, string> = { Sofas: sofa, Dining: dining, Beds: bed, Custom: armchair };
/** A neat drawn picture for a category, used whenever a product photo is missing or fails to load. */
export const illustration = (category?: string) => FRAME(ART[category ?? ''] ?? armchair);

type Props = ImgHTMLAttributes<HTMLImageElement> & { category?: string };

/** <img> that never shows a broken icon: a missing/failed photo is replaced by a drawing of the category. */
export default function Img({ category, src, ...rest }: Props) {
  const fallback = illustration(category);
  return <img loading="lazy" {...rest} src={src || fallback} onError={(e) => { if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }} />;
}
