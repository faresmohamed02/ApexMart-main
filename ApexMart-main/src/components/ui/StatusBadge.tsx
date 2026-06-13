import type { OrderStatus, CustomerStatus, ProductStatus } from '../../types/database';

type Status = OrderStatus | CustomerStatus | ProductStatus;

const config: Record<Status, { dot: string; pill: string; label: string }> = {
  delivered:  { dot: 'bg-emerald-400', pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Delivered' },
  pending:    { dot: 'bg-amber-400',   pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       label: 'Pending' },
  processing: { dot: 'bg-blue-400',    pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20',           label: 'Processing' },
  cancelled:  { dot: 'bg-red-400',     pill: 'bg-red-500/10 text-red-400 border-red-500/20',              label: 'Cancelled' },
  active:     { dot: 'bg-emerald-400', pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Active' },
  inactive:   { dot: 'bg-gray-400',    pill: 'bg-gray-500/10 text-gray-400 border-gray-500/20',           label: 'Inactive' },
  blocked:    { dot: 'bg-red-400',     pill: 'bg-red-500/10 text-red-400 border-red-500/20',              label: 'Blocked' },
  draft:      { dot: 'bg-amber-400',   pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       label: 'Draft' },
  archived:   { dot: 'bg-gray-400',    pill: 'bg-gray-500/10 text-gray-400 border-gray-500/20',           label: 'Archived' },
};

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status] ?? config.inactive;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mr-1.5 inline-block`} aria-hidden="true" />
      {c.label}
    </span>
  );
}

export function stockStatus(stock: number): ProductStatus | 'out_of_stock' | 'low_stock' {
  if (stock === 0) return 'out_of_stock';
  if (stock < 10) return 'low_stock';
  return 'active';
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" aria-hidden="true" />Out of Stock
    </span>
  );
  if (stock < 10) return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" aria-hidden="true" />Low Stock
    </span>
  );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" aria-hidden="true" />In Stock
    </span>
  );
}
