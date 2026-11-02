import { PageHeader } from './ui';

const items: [string, string][] = [
  ['Inventory', 'Add, edit and delete furniture. Stock, cost, price and SKU are for you only; customers never see them. Items at or below the "Low-stock alert" level appear under Low Stock Items.'],
  ['Orders', 'Order requests sent from the customer bag. Change the status (New, Contacted, Closed) and add notes. Use Call or WhatsApp to reach the customer.'],
  ['Customers', 'Everyone who signed in with a name and mobile number, with visit count and first and last login.'],
  ['Login Activity', 'A permanent history of every customer sign-in. It cannot be edited or deleted.'],
  ['Enquiries', 'Messages from the website enquiry form.'],
  ['Delete', 'The bin button moves a record to the Archived tab. From there you can Restore it, or delete it forever (cannot be undone). Only you, the signed-in owner, can do this.'],
  ['Downloads', 'Every list has PDF, Word (DOCX) and CSV buttons. They export what is currently shown, including your search and filters.'],
];
export default function Help() {
  return <div className="space-y-5"><PageHeader title="Help" /><div className="grid max-w-3xl gap-3">{items.map(([t, d]) => <div key={t} className="rounded-lg bg-white p-5"><h2 className="font-sans text-sm font-bold text-navy">{t}</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">{d}</p></div>)}</div></div>;
}
