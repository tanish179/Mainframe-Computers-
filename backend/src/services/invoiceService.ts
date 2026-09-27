import { supabaseAdmin } from '../config/supabase.js';
import { invoiceSchema } from '../schemas/index.js';
import { Invoice } from '../types/database.types.js';
import { logActivity } from './activityService.js';

export async function createInvoice(input: unknown, userId?: string): Promise<Invoice> {
  const validated = invoiceSchema.parse(input);

  const year = new Date().getFullYear();
  const { count } = await supabaseAdmin
    .from('invoices')
    .select('id', { count: 'exact', head: true });

  const seq = (count || 0) + 5001;
  const invoiceNumber = `INV-${year}-${seq.toString().padStart(5, '0')}`;

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert([
      {
        invoice_number: invoiceNumber,
        customer_id: validated.customer_id,
        sale_id: validated.sale_id || null,
        service_job_id: validated.service_job_id || null,
        subtotal: validated.subtotal,
        discount: validated.discount,
        tax: validated.tax,
        total: validated.total,
        issued_date: validated.issued_date || new Date().toISOString().split('T')[0],
        due_date: validated.due_date || null,
        status: 'issued',
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to create invoice: ${error.message}`);

  // Create receivable record automatically
  await supabaseAdmin.from('receivables').insert([
    {
      customer_id: validated.customer_id,
      invoice_id: data.id,
      total_amount: validated.total,
      paid_amount: 0,
      remaining_amount: validated.total,
      due_date: validated.due_date || null,
      status: 'pending',
    },
  ]);

  await logActivity({
    user_id: userId,
    action: 'Invoice Created',
    entity_type: 'invoice',
    entity_id: data.id,
    metadata: { invoice_number: invoiceNumber, total: validated.total },
  });

  return data as Invoice;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*, customers(*), sales(*), service_jobs(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch invoice: ${error.message}`);
  return data as Invoice | null;
}

export async function getInvoices(params?: {
  customer_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ invoices: Invoice[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin
    .from('invoices')
    .select('*, customers(name, phone)', { count: 'exact' });

  if (params?.customer_id) {
    query = query.eq('customer_id', params.customer_id);
  }

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);

  return {
    invoices: (data as Invoice[]) || [],
    total: count || 0,
  };
}
