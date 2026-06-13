import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Order, OrderStatus } from '../types/database';

const PAGE_SIZE = 10;

export interface OrdersFilter {
  search: string;
  status: OrderStatus | 'All';
  sortColumn: 'created_at' | 'total' | 'order_number';
  sortAsc: boolean;
  page: number;
}

export function useOrders(filter: OrdersFilter) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('orders')
        .select('*, customer:customers(*)', { count: 'exact' });

      if (filter.status !== 'All') query = query.eq('status', filter.status);
      if (filter.search.trim()) {
        query = query.or(
          `order_number.ilike.%${filter.search}%`
        );
      }

      query = query
        .order(filter.sortColumn, { ascending: filter.sortAsc })
        .range(filter.page * PAGE_SIZE, (filter.page + 1) * PAGE_SIZE - 1);

      const { data, error: err, count } = await query;
      if (err) throw err;

      setOrders((data ?? []) as Order[]);
      setTotal(count ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [filter.search, filter.status, filter.sortColumn, filter.sortAsc, filter.page]);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, total, pageSize: PAGE_SIZE, loading, error, refetch: fetch };
}

export function useOrderDetail(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) { setOrder(null); return; }
    setLoading(true);
    setError(null);
    supabase
      .from('orders')
      .select('*, customer:customers(*), items:order_items(*)')
      .eq('id', orderId)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setOrder(data as Order | null);
        setLoading(false);
      });
  }, [orderId]);

  return { order, loading, error };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}
