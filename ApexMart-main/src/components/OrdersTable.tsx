import { useState, useCallback } from 'react';
import { Search, Filter, ChevronDown, X, CheckSquare, Square } from 'lucide-react';
import { useOrders, updateOrderStatus, type OrdersFilter } from '../hooks/useOrders';
import { useOrderDetail } from '../hooks/useOrders';
import { Avatar } from './ui/Avatar';
import { StatusBadge } from './ui/StatusBadge';
import { SortableTh } from './ui/SortableTh';
import { Pagination } from './ui/Pagination';
import { SkeletonRow } from './ui/Skeleton';
import { EmptyOrders, ErrorBanner } from './ui/EmptyState';
import OrderDetailDrawer from './OrderDetailDrawer';
import type { OrderStatus } from '../types/database';

const STATUS_FILTERS: (OrderStatus | 'All')[] = ['All', 'Delivered', 'Processing', 'Pending', 'Cancelled'];

export default function OrdersTable() {
  const [filter, setFilter] = useState<OrdersFilter>({
    search: '',
    status: 'All',
    sortColumn: 'created_at',
    sortAsc: false,
    page: 0,
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);

  const { orders, total, pageSize, loading, error, refetch } = useOrders(filter);

  const handleSearch = useCallback(() => {
    setFilter(f => ({ ...f, search: searchInput, page: 0 }));
  }, [searchInput]);

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { setSearchInput(''); setFilter(f => ({ ...f, search: '', page: 0 })); }
  };

  const clearSearch = () => { setSearchInput(''); setFilter(f => ({ ...f, search: '', page: 0 })); };

  const setStatus = (s: OrderStatus | 'All') => setFilter(f => ({ ...f, status: s, page: 0 }));

  const toggleSort = (col: string) => {
    setFilter(f => ({
      ...f,
      sortColumn: col as OrdersFilter['sortColumn'],
      sortAsc: f.sortColumn === col ? !f.sortAsc : false,
      page: 0,
    }));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === orders.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(orders.map(o => o.id)));
  };

  const bulkUpdateStatus = async (status: OrderStatus) => {
    await Promise.all([...selectedIds].map(id => updateOrderStatus(id, status)));
    setSelectedIds(new Set());
    refetch();
  };

  return (
    <>
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">Recent Orders</h3>
              <p className="text-xs text-gray-500 mt-0.5">{total} total orders</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search order #…"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchKey}
                  onBlur={handleSearch}
                  className="input-field pl-8 pr-8 h-9 text-xs w-full sm:w-52"
                  aria-label="Search orders"
                />
                {searchInput && (
                  <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" aria-label="Clear search">
                    <X size={12} />
                  </button>
                )}
              </div>
              {/* Status filter */}
              <div className="relative group">
                <button className="btn-secondary h-9 text-xs gap-1.5 w-full sm:w-auto" aria-haspopup="listbox">
                  <Filter size={12} />
                  {filter.status === 'All' ? 'All Status' : filter.status}
                  <ChevronDown size={11} />
                </button>
                <div role="listbox" className="absolute right-0 top-full mt-1 w-44 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                  {STATUS_FILTERS.map(s => (
                    <button key={s} role="option" aria-selected={filter.status === s}
                      onClick={() => setStatus(s.toLowerCase() as OrderStatus | 'All')}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors first:rounded-t-xl last:rounded-b-xl ${filter.status === s ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {STATUS_FILTERS.map(s => (
              <button key={s}
                onClick={() => setStatus(s.toLowerCase() as OrderStatus | 'All')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 min-h-[32px] ${filter.status === s ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                aria-pressed={filter.status === s}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-4 flex-wrap">
            <span className="text-xs font-medium text-emerald-400">{selectedIds.size} selected</span>
            <button onClick={() => bulkUpdateStatus('delivered')} className="btn-primary text-xs h-7 px-3">Mark Delivered</button>
            <button onClick={() => bulkUpdateStatus('cancelled')} className="btn-secondary text-xs h-7 px-3">Cancel</button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-500 hover:text-gray-300 ml-auto">Deselect all</button>
          </div>
        )}

        {error && <div className="p-4"><ErrorBanner message={error} onRetry={refetch} /></div>}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 w-10" scope="col">
                  <button onClick={toggleAll} aria-label={selectedIds.size === orders.length ? 'Deselect all' : 'Select all'}
                    className="text-gray-500 hover:text-gray-300 transition-colors">
                    {selectedIds.size === orders.length && orders.length > 0
                      ? <CheckSquare size={15} className="text-emerald-400" />
                      : <Square size={15} />}
                  </button>
                </th>
                <SortableTh column="order_number" activeColumn={filter.sortColumn} ascending={filter.sortAsc} onSort={toggleSort}>Order</SortableTh>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell" scope="col">Product</th>
                <SortableTh column="created_at" activeColumn={filter.sortColumn} ascending={filter.sortAsc} onSort={toggleSort} className="hidden sm:table-cell">Date</SortableTh>
                <SortableTh column="total" activeColumn={filter.sortColumn} ascending={filter.sortAsc} onSort={toggleSort} className="text-right">Amount</SortableTh>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                : orders.length === 0
                  ? <tr><td colSpan={7}><EmptyOrders onClear={clearSearch} /></td></tr>
                  : orders.map(order => (
                      <tr key={order.id}
                        className="hover:bg-gray-800/30 transition-colors cursor-pointer group"
                        onClick={() => setDetailOrderId(order.id)}
                      >
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => toggleSelect(order.id)}
                            aria-label={`Select order ${order.order_number}`}
                            className="text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {selectedIds.has(order.id)
                              ? <CheckSquare size={15} className="text-emerald-400" />
                              : <Square size={15} />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{order.order_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              initials={order.customer?.avatar_initials ?? '??'}
                              color={order.customer?.avatar_color}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{order.customer?.name ?? '—'}</p>
                              <p className="text-xs text-gray-500 truncate">{order.customer?.email ?? ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-300">
                            {order.items?.[0]?.product_name ?? '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-white">${Number(order.total).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>

        <Pagination page={filter.page} total={total} pageSize={pageSize} onChange={p => setFilter(f => ({ ...f, page: p }))} />
      </div>

      <OrderDetailDrawer
        orderId={detailOrderId}
        onClose={() => setDetailOrderId(null)}
        onStatusChange={() => refetch()}
      />
    </>
  );
}
