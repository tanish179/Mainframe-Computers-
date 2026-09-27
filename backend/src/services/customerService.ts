import { supabaseAdmin } from '../config/supabase.js';
import { customerSchema, updateCustomerSchema } from '../schemas/index.js';
import { Customer } from '../types/database.types.js';
import { logActivity } from './activityService.js';

export async function createCustomer(
  input: unknown,
  userId?: string
): Promise<Customer> {
  const validated = customerSchema.parse(input);

  const { data, error } = await supabaseAdmin
    .from('customers')
    .insert([validated])
    .select()
    .single();

  if (error) throw new Error(`Failed to create customer: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Customer Created',
    entity_type: 'customer',
    entity_id: data.id,
    metadata: { name: data.name, phone: data.phone },
  });

  return data as Customer;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch customer: ${error.message}`);
  return data as Customer | null;
}

export async function getCustomers(params?: {
  query?: string;
  status?: 'active' | 'inactive';
  limit?: number;
  offset?: number;
}): Promise<{ customers: Customer[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin.from('customers').select('*', { count: 'exact' });

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.query) {
    const q = `%${params.query}%`;
    query = query.or(`name.ilike.${q},phone.ilike.${q},email.ilike.${q}`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch customers: ${error.message}`);

  return {
    customers: (data as Customer[]) || [],
    total: count || 0,
  };
}

export async function updateCustomer(
  id: string,
  input: unknown,
  userId?: string
): Promise<Customer> {
  const validated = updateCustomerSchema.parse(input);

  const { data, error } = await supabaseAdmin
    .from('customers')
    .update(validated)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update customer: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Customer Updated',
    entity_type: 'customer',
    entity_id: id,
    metadata: validated,
  });

  return data as Customer;
}

export async function getCustomerHistory(customerId: string) {
  const customer = await getCustomerById(customerId);
  if (!customer) throw new Error(`Customer with ID ${customerId} not found`);

  // 1. Service Jobs History
  const { data: serviceJobs } = await supabaseAdmin
    .from('service_jobs')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  // 2. Sales History
  const { data: sales } = await supabaseAdmin
    .from('sales')
    .select('*, sale_items(*, products(name, sku))')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  // 3. Invoices
  const { data: invoices } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  // 4. Payments
  const { data: payments } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  // 5. Receivables (Pending balances)
  const { data: receivables } = await supabaseAdmin
    .from('receivables')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  const totalPendingAmount = (receivables || [])
    .filter((r) => r.status !== 'paid' && r.status !== 'cancelled')
    .reduce((sum, r) => sum + Number(r.remaining_amount || 0), 0);

  return {
    customer,
    serviceJobs: serviceJobs || [],
    sales: sales || [],
    invoices: invoices || [],
    payments: payments || [],
    receivables: receivables || [],
    summary: {
      totalServiceJobs: (serviceJobs || []).length,
      totalSales: (sales || []).length,
      totalPaid: (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0),
      totalPendingBalance: totalPendingAmount,
    },
  };
}
