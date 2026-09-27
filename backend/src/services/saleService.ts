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

  // 1. Stock Validation for all items
  for (const item of validated.items) {
    const product = await getProductById(item.product_id);
    if (!product) {
      throw new Error(`Product with ID ${item.product_id} not found`);
    }
    if (product.stock_quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`
      );
    }
  }

  // 2. Calculate totals
  let subtotal = 0;
  const itemCalculations = validated.items.map((item) => {
    const itemSubtotal = item.unit_price * item.quantity;
    const itemTotal = Math.max(0, itemSubtotal - item.discount);
    subtotal += itemTotal;
    return {
      ...item,
      total: itemTotal,
    };
  });

  const totalDiscount = validated.discount || 0;
  const taxAmount = validated.tax || 0;
  const grandTotal = Math.max(0, subtotal - totalDiscount + taxAmount);

  const amountPaid = validated.amount_paid || 0;
  let paymentStatus: 'unpaid' | 'partially_paid' | 'paid' = 'unpaid';
  if (amountPaid >= grandTotal && grandTotal > 0) {
    paymentStatus = 'paid';
  } else if (amountPaid > 0) {
    paymentStatus = 'partially_paid';
  }

  const saleStatus = 'completed';

  // 3. Create Sale record
  const { data: sale, error: saleErr } = await supabaseAdmin
    .from('sales')
    .insert([
      {
        customer_id: validated.customer_id || null,
        subtotal,
        discount: totalDiscount,
        tax: taxAmount,
        total: grandTotal,
        payment_status: paymentStatus,
        status: saleStatus,
        notes: validated.notes || null,
        created_by: userId || null,
      },
    ])
    .select()
    .single();

  if (saleErr) throw new Error(`Failed to create sale: ${saleErr.message}`);

  // 4. Create Sale Items and Reduce Inventory
  const createdItems: SaleItem[] = [];
  for (const itemCalc of itemCalculations) {
    const { data: itemData, error: itemErr } = await supabaseAdmin
      .from('sale_items')
      .insert([
        {
          sale_id: sale.id,
          product_id: itemCalc.product_id,
          quantity: itemCalc.quantity,
          unit_price: itemCalc.unit_price,
          discount: itemCalc.discount,
          total: itemCalc.total,
        },
      ])
      .select()
      .single();

    if (itemErr) throw new Error(`Failed to create sale item: ${itemErr.message}`);
    createdItems.push(itemData as SaleItem);

    // Reduce inventory safely
    await recordInventoryTransaction(
      {
        product_id: itemCalc.product_id,
        type: 'stock_out',
        quantity: itemCalc.quantity,
        reference_type: 'sale',
        reference_id: sale.id,
        notes: `Sold in Sale #${sale.id}`,
      },
      userId
    );
  }

  // 5. Create Invoice automatically
  const { data: invoice } = await supabaseAdmin
    .from('invoices')
    .insert([
      {
        invoice_number: `INV-SALE-${Date.now().toString().slice(-6)}`,
        customer_id: validated.customer_id || null,
        sale_id: sale.id,
        subtotal,
        discount: totalDiscount,
        tax: taxAmount,
        total: grandTotal,
        status: paymentStatus === 'paid' ? 'paid' : paymentStatus === 'partially_paid' ? 'partially_paid' : 'issued',
      },
    ])
    .select()
    .single();

  if (invoice) {
    await supabaseAdmin.from('sales').update({ invoice_id: invoice.id }).eq('id', sale.id);

    // If remaining balance exists, create receivable
    const remaining = grandTotal - amountPaid;
    if (remaining > 0 && validated.customer_id) {
      await supabaseAdmin.from('receivables').insert([
        {
          customer_id: validated.customer_id,
          invoice_id: invoice.id,
          total_amount: grandTotal,
          paid_amount: amountPaid,
          remaining_amount: remaining,
          status: amountPaid > 0 ? 'partially_paid' : 'pending',
        },
      ]);
    }
  }

  // 6. Record Payment & Transaction if amount paid > 0
  if (amountPaid > 0 && validated.customer_id) {
    await supabaseAdmin.from('payments').insert([
      {
        customer_id: validated.customer_id,
        sale_id: sale.id,
        invoice_id: invoice?.id || null,
        amount: amountPaid,
        payment_method: validated.payment_method || 'cash',
        status: 'completed',
        created_by: userId || null,
      },
    ]);

    await supabaseAdmin.from('transactions').insert([
      {
        type: 'income',
        amount: amountPaid,
        reference_type: 'sale',
        reference_id: sale.id,
        description: `Payment received for Sale #${sale.id}`,
        payment_method: validated.payment_method || 'cash',
        status: 'completed',
      },
    ]);
  }

  await logActivity({
    user_id: userId,
    action: 'Sale Completed',
    entity_type: 'sale',
    entity_id: sale.id,
    metadata: { total: grandTotal, items_count: createdItems.length },
  });

  return {
    sale: sale as Sale,
    items: createdItems,
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
