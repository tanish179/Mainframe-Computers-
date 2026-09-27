import { supabaseAdmin } from '../config/supabase.js';
import { paymentSchema } from '../schemas/index.js';
import { Payment } from '../types/database.types.js';
import { logActivity } from './activityService.js';

export async function recordPayment(
  input: unknown,
  userId?: string
): Promise<Payment> {
  const validated = paymentSchema.parse(input);

  // 1. Insert Payment
  const { data: payment, error: payErr } = await supabaseAdmin
    .from('payments')
    .insert([
      {
        customer_id: validated.customer_id,
        invoice_id: validated.invoice_id || null,
        sale_id: validated.sale_id || null,
        service_job_id: validated.service_job_id || null,
        amount: validated.amount,
        payment_method: validated.payment_method,
        payment_date: validated.payment_date || new Date().toISOString(),
        reference: validated.reference || null,
        notes: validated.notes || null,
        status: 'completed',
        created_by: userId || null,
      },
    ])
    .select()
    .single();

  if (payErr) throw new Error(`Failed to record payment: ${payErr.message}`);

  // 2. Insert Financial Transaction Ledger
  await supabaseAdmin.from('transactions').insert([
    {
      type: 'income',
      amount: validated.amount,
      reference_type: validated.service_job_id
        ? 'service_job'
        : validated.invoice_id
        ? 'invoice'
        : validated.sale_id
        ? 'sale'
        : 'customer_payment',
      reference_id: validated.service_job_id || validated.invoice_id || validated.sale_id || payment.id,
      description: `Payment received (${validated.payment_method}) from customer ${validated.customer_id}`,
      payment_method: validated.payment_method,
      status: 'completed',
    },
  ]);

  // 3. Update Receivable if linked to Invoice
  if (validated.invoice_id) {
    const { data: rec } = await supabaseAdmin
      .from('receivables')
      .select('*')
      .eq('invoice_id', validated.invoice_id)
      .maybeSingle();

    if (rec) {
      const newPaid = Number(rec.paid_amount || 0) + validated.amount;
      const newRemaining = Math.max(0, Number(rec.total_amount || 0) - newPaid);
      const newStatus = newRemaining === 0 ? 'paid' : 'partially_paid';

      await supabaseAdmin
        .from('receivables')
        .update({
          paid_amount: newPaid,
          remaining_amount: newRemaining,
          status: newStatus,
        })
        .eq('id', rec.id);

      // Update Invoice status as well
      await supabaseAdmin
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', validated.invoice_id);
    }
  }

  // 4. Update Service Job if linked
  if (validated.service_job_id) {
    const { data: job } = await supabaseAdmin
      .from('service_jobs')
      .select('*')
      .eq('id', validated.service_job_id)
      .maybeSingle();

    if (job) {
      const newAdvancePaid = Number(job.advance_paid || 0) + validated.amount;
      const newRemaining = Math.max(0, Number(job.final_cost || job.estimated_cost || 0) - newAdvancePaid);

      await supabaseAdmin
        .from('service_jobs')
        .update({
          advance_paid: newAdvancePaid,
          remaining_amount: newRemaining,
        })
        .eq('id', job.id);
    }
  }

  await logActivity({
    user_id: userId,
    action: 'Payment Received',
    entity_type: 'payment',
    entity_id: payment.id,
    metadata: {
      amount: validated.amount,
      method: validated.payment_method,
      customer_id: validated.customer_id,
    },
  });

  return payment as Payment;
}

export async function getPayments(params?: {
  customer_id?: string;
  invoice_id?: string;
  service_job_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ payments: Payment[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin
    .from('payments')
    .select('*, customers(name, phone)', { count: 'exact' });

  if (params?.customer_id) query = query.eq('customer_id', params.customer_id);
  if (params?.invoice_id) query = query.eq('invoice_id', params.invoice_id);
  if (params?.service_job_id) query = query.eq('service_job_id', params.service_job_id);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch payments: ${error.message}`);

  return {
    payments: (data as Payment[]) || [],
    total: count || 0,
  };
}
