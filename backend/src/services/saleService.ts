import { supabaseAdmin } from '../config/supabase.js';
import { saleSchema } from '../schemas/index.js';
import { Sale, SaleItem } from '../types/database.types.js';
import { logActivity } from './activityService.js';
import { recordInventoryTransaction } from './inventoryService.js';
import { getProductById } from './productService.js';

export async function createSale(
  input: unknown,
  userId?: string
): Promise<{ sale: Sale; items: SaleItem[] }> {
  const validated = saleSchema.parse(input);

  // Default amount_paid if items exist and amount_paid not specified
  let amountPaid = validated.amount_paid;
  if (amountPaid === undefined) {
    if (validated.items && validated.items.length > 0) {
      const itemsSubtotal = validated.items.reduce(
        (acc, item) => acc + (item.unit_price * item.quantity - (item.discount || 0)),
        0
      );
      amountPaid = Math.max(0, itemsSubtotal - (validated.discount || 0) + (validated.tax || 0));
    } else {
      amountPaid = 0;
    }
  }

  // Invoke atomic PostgreSQL RPC function
  const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc('create_sale_transaction', {
    p_customer_id: validated.customer_id || null,
    p_description: validated.description || null,
    p_items: validated.items || [],
    p_discount: validated.discount || 0,
    p_tax: validated.tax || 0,
    p_payment_method: validated.payment_method || 'cash',
    p_amount_paid: amountPaid,
    p_notes: validated.notes || null,
    p_created_by: userId || null,
  });

  if (rpcErr) {
    throw new Error(`Failed to create sale transaction: ${rpcErr.message}`);
  }

  const saleId = rpcResult?.sale_id;

  // Fetch created sale & sale items
  const { data: sale, error: fetchSaleErr } = await supabaseAdmin
    .from('sales')
    .select('*')
    .eq('id', saleId)
    .single();

  if (fetchSaleErr || !sale) {
    throw new Error(`Failed to retrieve created sale #${saleId}`);
  }

  const { data: items } = await supabaseAdmin
    .from('sale_items')
    .select('*')
    .eq('sale_id', saleId);

  await logActivity({
    user_id: userId,
    action: 'Sale Completed',
    entity_type: 'sale',
    entity_id: sale.id,
    metadata: { total: sale.total, items_count: items?.length || 0 },
  });

  return {
    sale: sale as Sale,
    items: (items as SaleItem[]) || [],
  };
}

export async function getSaleById(id: string): Promise<{ sale: Sale; items: SaleItem[] } | null> {
  const { data: sale, error } = await supabaseAdmin
    .from('sales')
    .select('*, customers(*), invoices(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !sale) return null;

  const { data: items } = await supabaseAdmin
    .from('sale_items')
    .select('*, products(*)')
    .eq('sale_id', id);

  return {
    sale: sale as Sale,
    items: (items as SaleItem[]) || [],
  };
}

export async function getSales(params?: {
  customer_id?: string;
  payment_status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ sales: Sale[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin
    .from('sales')
    .select('*, customers(name, phone)', { count: 'exact' });

  if (params?.customer_id) {
    query = query.eq('customer_id', params.customer_id);
  }

  if (params?.payment_status) {
    query = query.eq('payment_status', params.payment_status);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch sales: ${error.message}`);

  return {
    sales: (data as Sale[]) || [],
    total: count || 0,
  };
}
