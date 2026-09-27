import { supabaseAdmin } from '../config/supabase.js';
import { inventoryTransactionSchema } from '../schemas/index.js';
import { InventoryTransaction, InventoryTransactionType, Product } from '../types/database.types.js';
import { logActivity } from './activityService.js';
import { getProductById } from './productService.js';

export async function recordInventoryTransaction(
  input: {
    product_id: string;
    type: InventoryTransactionType;
    quantity: number;
    reference_type?: string | null;
    reference_id?: string | null;
    notes?: string | null;
  },
  userId?: string
): Promise<{ transaction: InventoryTransaction; updatedProduct: Product }> {
  const validated = inventoryTransactionSchema.parse(input);

  const product = await getProductById(validated.product_id);
  if (!product) {
    throw new Error(`Product with ID ${validated.product_id} not found`);
  }

  // Calculate new stock
  let stockDelta = 0;
  switch (validated.type) {
    case 'stock_in':
    case 'returned':
      stockDelta = Math.abs(validated.quantity);
      break;
    case 'stock_out':
    case 'used_in_service':
    case 'damaged':
      stockDelta = -Math.abs(validated.quantity);
      break;
    case 'adjustment':
      stockDelta = validated.quantity; // Can be positive or negative
      break;
  }

  const newStock = product.stock_quantity + stockDelta;
  if (newStock < 0) {
    throw new Error(
      `Insufficient stock for product "${product.name}". Current: ${product.stock_quantity}, Required change: ${stockDelta}`
    );
  }

  // Update product stock
  const { data: updatedProduct, error: productErr } = await supabaseAdmin
    .from('products')
    .update({ stock_quantity: newStock })
    .eq('id', product.id)
    .select()
    .single();

  if (productErr) {
    throw new Error(`Failed to update product stock: ${productErr.message}`);
  }

  // Insert inventory transaction
  const { data: transaction, error: txErr } = await supabaseAdmin
    .from('inventory_transactions')
    .insert([
      {
        product_id: validated.product_id,
        type: validated.type,
        quantity: validated.quantity,
        reference_type: validated.reference_type || null,
        reference_id: validated.reference_id || null,
        notes: validated.notes || null,
      },
    ])
    .select()
    .single();

  if (txErr) {
    throw new Error(`Failed to record inventory transaction: ${txErr.message}`);
  }

  await logActivity({
    user_id: userId,
    action: 'Inventory Changed',
    entity_type: 'inventory',
    entity_id: transaction.id,
    metadata: {
      product_id: product.id,
      product_name: product.name,
      type: validated.type,
      quantity: validated.quantity,
      previous_stock: product.stock_quantity,
      new_stock: newStock,
    },
  });

  return {
    transaction: transaction as InventoryTransaction,
    updatedProduct: updatedProduct as Product,
  };
}

export async function getInventoryTransactions(params?: {
  product_id?: string;
  type?: InventoryTransactionType;
  limit?: number;
  offset?: number;
}): Promise<InventoryTransaction[]> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin.from('inventory_transactions').select('*');

  if (params?.product_id) {
    query = query.eq('product_id', params.product_id);
  }
  if (params?.type) {
    query = query.eq('type', params.type);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch inventory transactions: ${error.message}`);
  return (data as InventoryTransaction[]) || [];
}
