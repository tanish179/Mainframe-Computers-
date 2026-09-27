import { supabaseAdmin } from '../config/supabase.js';
import { productSchema, updateProductSchema } from '../schemas/index.js';
import { Product, ProductCategory } from '../types/database.types.js';
import { logActivity } from './activityService.js';

export async function createProduct(input: unknown, userId?: string): Promise<Product> {
  const validated = productSchema.parse(input);

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([validated])
    .select()
    .single();

  if (error) throw new Error(`Failed to create product: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Product Added',
    entity_type: 'product',
    entity_id: data.id,
    metadata: { name: data.name, sku: data.sku, stock: data.stock_quantity },
  });

  return data as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch product: ${error.message}`);
  return data as Product | null;
}

export async function getProducts(params?: {
  category?: ProductCategory;
  query?: string;
  low_stock_only?: boolean;
  status?: 'active' | 'inactive' | 'discontinued';
  limit?: number;
  offset?: number;
}): Promise<{ products: Product[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin.from('products').select('*', { count: 'exact' });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.category) {
    query = query.eq('category', params.category);
  }

  if (params?.query) {
    const q = `%${params.query}%`;
    query = query.or(`name.ilike.${q},sku.ilike.${q},brand.ilike.${q},model.ilike.${q}`);
  }

  const { data, count, error } = await query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch products: ${error.message}`);

  let products = (data as Product[]) || [];
  if (params?.low_stock_only) {
    products = products.filter((p) => p.stock_quantity <= p.minimum_stock_level);
  }

  return {
    products,
    total: params?.low_stock_only ? products.length : count || 0,
  };
}

export async function getLowStockProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('status', 'active');

  if (error) throw new Error(`Failed to fetch low stock products: ${error.message}`);

  const products = (data as Product[]) || [];
  return products.filter((p) => p.stock_quantity <= p.minimum_stock_level);
}

export async function updateProduct(
  id: string,
  input: unknown,
  userId?: string
): Promise<Product> {
  const validated = updateProductSchema.parse(input);

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(validated)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update product: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Product Updated',
    entity_type: 'product',
    entity_id: id,
    metadata: validated,
  });

  return data as Product;
}
