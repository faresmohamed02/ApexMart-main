import { useState, useCallback } from 'react';
import { Search, X, ChevronDown, AlertTriangle } from 'lucide-react';
import { useProducts, archiveProduct, type ProductsFilter } from '../hooks/useProducts';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge, StockBadge } from '../components/ui/StatusBadge';
import { SortableTh } from '../components/ui/SortableTh';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonRow } from '../components/ui/Skeleton';
import { EmptyProducts, ErrorBanner } from '../components/ui/EmptyState';
import AddProductModal from '../components/AddProductModal';
import type { Product } from '../types/database';

const CATEGORIES = ['All', 'Electronics', 'Fashion & Apparel', 'Home & Garden', 'Sports & Outdoors', 'Beauty & Health', 'Books & Media'];

export default function ProductsPage() {
  const [filter, setFilter] = useState<ProductsFilter>({
    search: '', category: '', sortColumn: 'created_at', sortAsc: false, page: 0,
  });
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const { products, total, pageSize, loading, error, refetch } = useProducts(filter);

  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10);
  const outOfStock = products.filter(p => p.stock === 0);

  const applySearch = useCallback(() => {
    setFilter(f => ({ ...f, search: searchInput, page: 0 }));
  }, [searchInput]);

  const toggleSort = (col: string) => {
    setFilter(f => ({
      ...f,
      sortColumn: col as ProductsFilter['sortColumn'],
      sortAsc: f.sortColumn === col ? !f.sortAsc : false,
      page: 0,
    }));
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await archiveProduct(deleteConfirm.id);
    setDeleteConfirm(null);
    refetch();
  };

  return (
    <div className="px-4 lg:px-6 py-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} products in inventory</p>
        </div>
        <button onClick={() => { setEditProduct(undefined); setModalOpen(true); }} className="btn-primary">
          + Add Product
        </button>
      </div>

      {/* Alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {outOfStock.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex-1">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <p className="text-sm"><span className="font-semibold">{outOfStock.length} product{outOfStock.length > 1 ? 's' : ''} out of stock:</span>{' '}{outOfStock.map(p => p.name).join(', ')}</p>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-1">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <p className="text-sm"><span className="font-semibold">{lowStock.length} product{lowStock.length > 1 ? 's' : ''} running low:</span>{' '}{lowStock.map(p => `${p.name} (${p.stock})`).join(', ')}</p>
            </div>
          )}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text" placeholder="Search products, SKU…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') applySearch(); if (e.key === 'Escape') { setSearchInput(''); setFilter(f => ({ ...f, search: '' })); } }}
              onBlur={applySearch}
              className="input-field pl-8 pr-8 h-9 text-xs w-full"
            />
            {searchInput && <button onClick={() => { setSearchInput(''); setFilter(f => ({ ...f, search: '', page: 0 })); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"><X size={12} /></button>}
          </div>

          {/* Category filter */}
          <div className="relative group">
            <button className="btn-secondary h-9 text-xs gap-1.5">
              {filter.category || 'All Categories'}
              <ChevronDown size={11} />
            </button>
            <div className="absolute left-0 top-full mt-1 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilter(f => ({ ...f, category: c === 'All' ? '' : c, page: 0 }))}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors first:rounded-t-xl last:rounded-b-xl ${(filter.category === '' ? c === 'All' : filter.category === c) ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="p-4"><ErrorBanner message={error} onRetry={refetch} /></div>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell" scope="col">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell" scope="col">Category</th>
                <SortableTh column="price" activeColumn={filter.sortColumn} ascending={filter.sortAsc} onSort={toggleSort}>Price</SortableTh>
                <SortableTh column="stock" activeColumn={filter.sortColumn} ascending={filter.sortAsc} onSort={toggleSort}>Stock</SortableTh>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                : products.length === 0
                  ? <tr><td colSpan={7}><EmptyProducts onAdd={() => setModalOpen(true)} /></td></tr>
                  : products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.image_url
                              ? <img src={product.image_url} alt={product.name} className="w-9 h-9 rounded-lg object-cover bg-gray-800 flex-shrink-0" />
                              : <Avatar initials={product.name.slice(0,2).toUpperCase()} size="sm" color="from-gray-600 to-gray-700" />
                            }
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate max-w-[180px]">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate">{product.description?.slice(0, 50)}…</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell"><span className="text-xs font-mono text-gray-400 bg-gray-800 px-2 py-1 rounded">{product.sku}</span></td>
                        <td className="px-6 py-4 hidden lg:table-cell"><span className="text-sm text-gray-400">{product.category}</span></td>
                        <td className="px-6 py-4"><span className="text-sm font-semibold text-white">${Number(product.price).toLocaleString()}</span></td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-white">{product.stock}</p>
                            <StockBadge stock={product.stock} />
                          </div>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditProduct(product); setModalOpen(true); }}
                              className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg transition-colors">Edit</button>
                            <button onClick={() => setDeleteConfirm(product)}
                              className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-2.5 py-1 rounded-lg transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>

        <Pagination page={filter.page} total={total} pageSize={pageSize} onChange={p => setFilter(f => ({ ...f, page: p }))} />
      </div>

      <AddProductModal
        isOpen={modalOpen}
        editProduct={editProduct}
        onClose={() => { setModalOpen(false); setEditProduct(undefined); }}
        onSaved={refetch}
      />

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-400 mb-5">
              <span className="text-white font-medium">{deleteConfirm.name}</span> will be archived and hidden from the store.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded-xl transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
