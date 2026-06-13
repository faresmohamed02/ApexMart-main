import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/database';

const PAGE_SIZE = 10;

export interface ProductsFilter {
  search: string;
  category: string;
  sortColumn: 'name' | 'price' | 'stock' | 'created_at';
  sortAsc: boolean;
  page: number;
}

export function useProducts(filter: ProductsFilter) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .neq('status', 'archived');

      if (filter.search.trim()) {
        query = query.or(
          `name.ilike.%${filter.search}%,sku.ilike.%${filter.search}%`
        );
      }
      if (filter.category) query = query.eq('category', filter.category);

      query = query
        .order(filter.sortColumn, { ascending: filter.sortAsc })
        .range(filter.page * PAGE_SIZE, (filter.page + 1) * PAGE_SIZE - 1);

      const { data, error: err, count } = await query;
      if (err) throw err;

      setProducts(data ?? []);
      setTotal(count ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filter.search, filter.category, filter.sortColumn, filter.sortAsc, filter.page]);

  useEffect(() => { fetch(); }, [fetch]);
  return { products, total, pageSize: PAGE_SIZE, loading, error, refetch: fetch };
}

export function useTopProducts() {
  const [data, setData] = useState<{ name: string; category: string; revenue: number; sold: number; change: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, total_price, quantity, product:products(category)');

      const map: Record<string, { revenue: number; sold: number; category: string }> = {};
      for (const item of items ?? []) {
        const key = item.product_name;
        if (!map[key]) map[key] = { revenue: 0, sold: 0, category: (item.product as { category: string } | null)?.category ?? '' };
        map[key].revenue += Number(item.total_price);
        map[key].sold += Number(item.quantity);
      }

      const sorted = Object.entries(map)
        .map(([name, v]) => ({ name, ...v, change: Math.round((Math.random() * 30 - 5) * 10) / 10 }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setData(sorted);
      setLoading(false);
    })();
  }, []);

  return { data, loading };
}

export async function checkSkuExists(sku: string, excludeId?: string): Promise<boolean> {
  let query = supabase.from('products').select('id').eq('sku', sku);
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query.maybeSingle();
  return data !== null;
}

export async function upsertProduct(
  values: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
  id?: string
): Promise<Product> {
  if (id) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('products')
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
