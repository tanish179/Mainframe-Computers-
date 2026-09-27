import { supabaseAdmin } from '../config/supabase.js';
import { Receivable } from '../types/database.types.js';

export async function getReceivables(params?: {
  customer_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ receivables: Receivable[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin
    .from('receivables')
    .select('*, customers(name, phone), invoices(invoice_number, total)', { count: 'exact' });

  if (params?.customer_id) query = query.eq('customer_id', params.customer_id);
  if (params?.status) query = query.eq('status', params.status);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch receivables: ${error.message}`);

  return {
    receivables: (data as Receivable[]) || [],
    total: count || 0,
  };
}
