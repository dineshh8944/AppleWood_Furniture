import type { ReactNode } from 'react';
import { fmtDate } from '../../lib/format';
import { STATUSES, CATEGORIES, type Customer, type Enquiry, type LoginEvent, type OrderRequest } from '../../lib/types';
import { StatusBadge } from './ui';

export interface Column<T> { label: string; text: (r: T) => string; cell?: (r: T) => ReactNode }
export interface Field { name: string; label: string; type?: 'text' | 'tel' | 'email' | 'number' | 'textarea' | 'select' | 'image' | 'tags'; options?: readonly string[]; required?: boolean }
export interface Cfg<T extends { id: number }> {
  title: string; addLabel: string; hint: string; endpoint: string; file: string; columns: Column<T>[]; fields: Field[];
  readOnly?: boolean; contact?: boolean; statusFilter?: boolean;
}

export const customerCfg: Cfg<Customer> = {
  title: 'Customers', addLabel: 'Add Customer', endpoint: 'customers', file: 'customers', contact: true,
  hint: 'Everyone who signed in on the website with their name and mobile number.',
  columns: [
    { label: 'Name', text: (r) => r.name }, { label: 'Mobile', text: (r) => r.mobile }, { label: 'Email', text: (r) => r.email || '-' },
    { label: 'Visits', text: (r) => String(r.loginCount) }, { label: 'First login', text: (r) => fmtDate(r.createdAt) }, { label: 'Last login', text: (r) => fmtDate(r.lastLoginAt) },
  ],
  fields: [{ name: 'name', label: 'Name', required: true }, { name: 'mobile', label: 'Mobile', type: 'tel', required: true }, { name: 'email', label: 'Email', type: 'email' }],
};

export const loginCfg: Cfg<LoginEvent> = {
  title: 'Login Activity', addLabel: '', endpoint: 'login-events', file: 'login-activity', readOnly: true, contact: true,
  hint: 'Every customer sign-in with date and time. This history is read-only: it cannot be edited or erased.',
  columns: [
    { label: 'Date & time', text: (r) => fmtDate(r.at) }, { label: 'Name', text: (r) => r.name }, { label: 'Mobile', text: (r) => r.mobile },
    { label: 'IP address', text: (r) => r.ip || '-' }, { label: 'Device', text: (r) => (r.device || '-').slice(0, 70) },
  ],
  fields: [],
};

export const enquiryCfg: Cfg<Enquiry> = {
  title: 'Enquiries', addLabel: 'Add Enquiry', endpoint: 'enquiries', file: 'enquiries', contact: true, statusFilter: true,
  hint: 'Queries sent from the website enquiry form. Track each one with a status.',
  columns: [
    { label: 'Date', text: (r) => fmtDate(r.createdAt) }, { label: 'Name', text: (r) => r.name }, { label: 'Mobile', text: (r) => r.mobile }, { label: 'Email', text: (r) => r.email || '-' },
    { label: 'Interested in', text: (r) => r.interest }, { label: 'Status', text: (r) => r.status, cell: (r) => <StatusBadge s={r.status} /> }, { label: 'Note', text: (r) => r.note || '' },
  ],
  fields: [
    { name: 'name', label: 'Name', required: true }, { name: 'mobile', label: 'Mobile', type: 'tel', required: true }, { name: 'email', label: 'Email', type: 'email' },
    { name: 'interest', label: 'Interested in', required: true }, { name: 'status', label: 'Status', type: 'select', options: STATUSES }, { name: 'note', label: 'Note', type: 'textarea' },
  ],
};

export const requestCfg: Cfg<OrderRequest> = {
  title: 'Orders', addLabel: 'Add Order', endpoint: 'requests', file: 'orders', contact: true, statusFilter: true,
  hint: 'Order requests from the customer bag. No payment is taken on the website.',
  columns: [
    { label: 'Date', text: (r) => fmtDate(r.createdAt) }, { label: 'Name', text: (r) => r.name }, { label: 'Mobile', text: (r) => r.mobile }, { label: 'Address', text: (r) => r.address || '-' },
    { label: 'Items', text: (r) => r.items.map((i) => `${i.name}${i.color ? ` (${i.color})` : ''} x${i.quantity}`).join(', ') },
    { label: 'Status', text: (r) => r.status, cell: (r) => <StatusBadge s={r.status} /> }, { label: 'Note', text: (r) => r.note || '' },
  ],
  fields: [
    { name: 'name', label: 'Name', required: true }, { name: 'mobile', label: 'Mobile', type: 'tel', required: true }, { name: 'address', label: 'Address', type: 'textarea' },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES }, { name: 'note', label: 'Note', type: 'textarea' },
  ],
};

export const productFields: Field[] = [
  { name: 'name', label: 'Product name', required: true }, { name: 'category', label: 'Category', type: 'select', options: CATEGORIES },
  { name: 'type', label: 'Size (e.g. 3-Seater)' }, { name: 'grade', label: 'Type / grade (e.g. A1)' }, { name: 'sku', label: 'SKU No' },
  { name: 'stock', label: 'Stock (units)', type: 'number' }, { name: 'reorderLevel', label: 'Low-stock alert at', type: 'number' },
  { name: 'cost', label: 'Cost (Rs.)', type: 'number' }, { name: 'price', label: 'Price (Rs.) - owner only, not shown to customers', type: 'number' },
  { name: 'material', label: 'Material' }, { name: 'colors', label: 'Colours (comma separated)', type: 'tags' }, { name: 'tag', label: 'Tag line (e.g. Family favourite)' },
  { name: 'image', label: 'Image', type: 'image' }, { name: 'description', label: 'Description', type: 'textarea' },
];
