import { useState, useRef, useEffect } from 'react';
import { X, Package, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { upsertProduct, checkSkuExists } from '../hooks/useProducts';
import type { Product } from '../types/database';

interface Props {
  isOpen: boolean;
  editProduct?: Product;
  onClose: () => void;
  onSaved: () => void;
}

interface FormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  sku: string;
  description: string;
}

interface FormErrors {
  name?: string;
  category?: string;
  price?: string;
  stock?: string;
  sku?: string;
}

const CATEGORIES = ['Electronics','Fashion & Apparel','Home & Garden','Sports & Outdoors','Beauty & Health','Books & Media','Toys & Games','Automotive'];

export default function AddProductModal({ isOpen, editProduct, onClose, onSaved }: Props) {
  const isEdit = !!editProduct;
  const [form, setForm] = useState<FormData>({ name: '', category: '', price: '', stock: '', sku: '', description: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && editProduct) {
        setForm({
          name: editProduct.name,
          category: editProduct.category,
          price: String(editProduct.price),
          stock: String(editProduct.stock),
          sku: editProduct.sku,
          description: editProduct.description ?? '',
        });
      } else {
        setForm({ name: '', category: '', price: '', stock: '', sku: '', description: '' });
      }
      setErrors({});
      setSubmitted(false);
      setTimeout(() => firstFieldRef.current?.focus(), 60);
    }
  }, [isOpen, isEdit, editProduct]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    setTimeout(() => triggerRef.current?.focus(), 50);
  };

  const update = (field: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  const validate = async (): Promise<boolean> => {
    const errs: FormErrors = {};
    if (!form.name.trim() || form.name.length < 3) errs.name = 'Name must be at least 3 characters';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = 'Enter a valid price';
    if (!form.stock || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errs.stock = 'Enter a valid stock count';
    if (!form.sku.trim()) {
      errs.sku = 'SKU is required';
    } else {
      const exists = await checkSkuExists(form.sku.trim(), editProduct?.id);
      if (exists) errs.sku = 'SKU already in use';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const valid = await validate();
    if (!valid) return;
    setSaving(true);
    try {
      await upsertProduct({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        sku: form.sku.trim(),
        description: form.description.trim(),
        image_url: editProduct?.image_url ?? '',
        status: editProduct?.status ?? 'active',
      }, editProduct?.id);
      setSubmitted(true);
      onSaved();
      setTimeout(() => handleClose(), 1600);
    } catch (err) {
      setErrors({ name: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Package size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-white">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
              <p className="text-xs text-gray-500">{isEdit ? 'Update product details' : 'Fill in the product details'}</p>
            </div>
          </div>
          <button onClick={handleClose} aria-label="Close modal" className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Check size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Product {isEdit ? 'Updated' : 'Added'}!</h3>
            <p className="text-sm text-gray-400 text-center">
              <span className="text-emerald-400 font-medium">{form.name}</span> has been successfully {isEdit ? 'updated in' : 'added to'} your inventory.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="prod-name" className="block text-xs font-medium text-gray-300 mb-1.5">Product Name <span className="text-red-400" aria-hidden="true">*</span></label>
                <input
                  ref={firstFieldRef}
                  id="prod-name"
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  aria-describedby={errors.name ? 'prod-name-err' : undefined}
                  aria-invalid={!!errors.name}
                  placeholder="e.g. Sony WH-1000XM5"
                  className={`input-field ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.name && <p id="prod-name-err" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
              </div>

              {/* Category */}
              <div>
                <label id="cat-label" className="block text-xs font-medium text-gray-300 mb-1.5">Category <span className="text-red-400" aria-hidden="true">*</span></label>
                <div className="relative">
                  <button type="button" role="combobox" aria-expanded={catOpen} aria-labelledby="cat-label"
                    onClick={() => setCatOpen(o => !o)}
                    className={`select-field flex items-center justify-between ${errors.category ? 'border-red-500' : ''}`}>
                    <span className={form.category ? 'text-white' : 'text-gray-500'}>{form.category || 'Select a category'}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {catOpen && (
                    <div role="listbox" className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
                      {CATEGORIES.map(cat => (
                        <button key={cat} type="button" role="option" aria-selected={form.category === cat}
                          onClick={() => { update('category', cat); setCatOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${form.category === cat ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                          {cat}
                          {form.category === cat && <Check size={13} className="text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.category && <p role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} />{errors.category}</p>}
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-price" className="block text-xs font-medium text-gray-300 mb-1.5">Price (USD) <span className="text-red-400" aria-hidden="true">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none" aria-hidden="true">$</span>
                    <input id="prod-price" type="number" value={form.price} onChange={e => update('price', e.target.value)}
                      aria-describedby={errors.price ? 'prod-price-err' : undefined} aria-invalid={!!errors.price}
                      placeholder="0.00" step="0.01" min="0"
                      className={`input-field pl-7 ${errors.price ? 'border-red-500' : ''}`} />
                  </div>
                  {errors.price && <p id="prod-price-err" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} />{errors.price}</p>}
                </div>
                <div>
                  <label htmlFor="prod-stock" className="block text-xs font-medium text-gray-300 mb-1.5">Stock Qty <span className="text-red-400" aria-hidden="true">*</span></label>
                  <input id="prod-stock" type="number" value={form.stock} onChange={e => update('stock', e.target.value)}
                    aria-describedby={errors.stock ? 'prod-stock-err' : undefined} aria-invalid={!!errors.stock}
                    placeholder="0" min="0" step="1"
                    className={`input-field ${errors.stock ? 'border-red-500' : ''}`} />
                  {errors.stock && <p id="prod-stock-err" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} />{errors.stock}</p>}
                </div>
              </div>

              {/* SKU */}
              <div>
                <label htmlFor="prod-sku" className="block text-xs font-medium text-gray-300 mb-1.5">SKU <span className="text-red-400" aria-hidden="true">*</span></label>
                <input id="prod-sku" type="text" value={form.sku} onChange={e => update('sku', e.target.value)}
                  aria-describedby={errors.sku ? 'prod-sku-err' : undefined} aria-invalid={!!errors.sku}
                  placeholder="e.g. ELEC-SONY-WH1000"
                  className={`input-field font-mono ${errors.sku ? 'border-red-500' : ''}`} />
                {errors.sku && <p id="prod-sku-err" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} />{errors.sku}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="prod-desc" className="block text-xs font-medium text-gray-300 mb-1.5">Description <span className="text-gray-600">(optional)</span></label>
                <textarea id="prod-desc" value={form.description} onChange={e => update('description', e.target.value)}
                  placeholder="Describe your product…" rows={3} className="input-field resize-none" />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3 bg-gray-900/80 sticky bottom-0">
              <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
