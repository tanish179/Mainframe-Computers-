import { supabaseAdmin } from '../config/supabase.js';
import { supplierSchema, updateSupplierSchema } from '../schemas/index.js';
import { Supplier } from '../types/database.types.js';
import { logActivity } from './activityService.js';

export async function createSupplier(input: unknown, userId?: string): Promise<Supplier> {
  const validated = supplierSchema.parse(input);

  const { data, error } = await supabaseAdmin
    .from('suppliers')
    .insert([validated])
    .select()
    .single();

  if (error) throw new Error(`Failed to create supplier: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Supplier Created',
    entity_type: 'supplier',
    entity_id: data.id,
    metadata: { name: data.name, company: data.company },
  });

  return data as Supplier;
}

export async function getSuppliers(params?: {
  query?: string;
  status?: 'active' | 'inactive';
}): Promise<Supplier[]> {
  let query = supabaseAdmin.from('suppliers').select('*');

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.query) {
    const q = `%${params.query}%`;
    query = query.or(`name.ilike.${q},company.ilike.${q},phone.ilike.${q}`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch suppliers: ${error.message}`);
  return (data as Supplier[]) || [];
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const { data, error } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch supplier: ${error.message}`);
  return data as Supplier | null;
}

export async function updateSupplier(id: string, input: unknown, userId?: string): Promise<Supplier> {
  const validated = updateSupplierSchema.parse(input);

  const { data, error } = await supabaseAdmin
    .from('suppliers')
    .update(validated)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update supplier: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Supplier Updated',
    entity_type: 'supplier',
    entity_id: id,
    metadata: validated,
  });

  return data as Supplier;
}
