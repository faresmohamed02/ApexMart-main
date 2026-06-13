import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer } from '../types/database';

const PAGE_SIZE = 10;

export interface CustomersFilter {
  search: string;
  status: Customer['status'] | 'All';
  sortColumn: 'name' | 'lifetime_value' | 'total_orders' | 'created_at';
  sortAsc: boolean;
  page: number;
}

export function useCustomers(filter: CustomersFilter) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('customers').select('*', { count: 'exact' });

      if (filter.status !== 'All') query = query.eq('status', filter.status);
      if (filter.search.trim()) {
        query = query.or(
          `name.ilike.%${filter.search}%,email.ilike.%${filter.search}%`
        );
      }

      query = query
        .order(filter.sortColumn, { ascending: filter.sortAsc })
        .range(filter.page * PAGE_SIZE, (filter.page + 1) * PAGE_SIZE - 1);

      const { data, error: err, count } = await query;
      if (err) throw err;

      setCustomers(data ?? []);
      setTotal(count ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [filter.search, filter.status, filter.sortColumn, filter.sortAsc, filter.page]);

  useEffect(() => { fetch(); }, [fetch]);
  return { customers, total, pageSize: PAGE_SIZE, loading, error, refetch: fetch };
}

export function useCustomerOrders(customerId: string | null) {
  const [orders, setOrders] = useState<{ id: string; order_number: string; total: number; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customerId) { setOrders([]); return; }
    setLoading(true);
    supabase
      .from('orders')
      .select('id, order_number, total, status, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, [customerId]);

  return { orders, loading };
}
