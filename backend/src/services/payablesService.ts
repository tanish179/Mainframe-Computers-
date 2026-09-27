import { supabaseAdmin } from '../config/supabase.js';
import { Payable } from '../types/database.types.js';
import { logActivity } from './activityService.js';

export async function createPayable(
  input: {
    supplier_id?: string | null;
    description: string;
    amount: number;
    due_date?: string | null;
  },
  userId?: string
): Promise<Payable> {
  const remaining = input.amount;

  const { data, error } = await supabaseAdmin
    .from('payables')
    .insert([
      {
        supplier_id: input.supplier_id || null,
        description: input.description,
        amount: input.amount,
        paid_amount: 0,
        remaining_amount: remaining,
        due_date: input.due_date || null,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to create payable: ${error.message}`);

  await logActivity({
    user_id: userId,
    action: 'Payable Created',
    entity_type: 'payable',
    entity_id: data.id,
    metadata: { description: input.description, amount: input.amount },
  });

  return data as Payable;
}

export async function recordPayablePayment(
  payableId: string,
  amount: number,
  paymentMethod: string,
  userId?: string
): Promise<Payable> {
  const { data: payable } = await supabaseAdmin
    .from('payables')
    .select('*')
    .eq('id', payableId)
    .single();

  if (!payable) throw new Error(`Payable ${payableId} not found`);

  const newPaid = Number(payable.paid_amount || 0) + amount;
  const newRemaining = Math.max(0, Number(payable.amount || 0) - newPaid);
  const newStatus = newRemaining === 0 ? 'paid' : 'partially_paid';

  const { data: updated, error } = await supabaseAdmin
    .from('payables')
    .update({
      paid_amount: newPaid,
      remaining_amount: newRemaining,
      status: newStatus,
    })
    .eq('id', payableId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update payable payment: ${error.message}`);

  // Ledger transaction (expense)
  await supabaseAdmin.from('transactions').insert([
    {
      type: 'expense',
      amount,
      reference_type: 'payable',
      reference_id: payableId,
      description: `Payment to supplier: ${payable.description}`,
      payment_method: paymentMethod,
      status: 'completed',
    },
  ]);

  await logActivity({
    user_id: userId,
    action: 'Payable Payment Recorded',
    entity_type: 'payable',
    entity_id: payableId,
    metadata: { amount, remaining: newRemaining },
  });

  return updated as Payable;
}

export async function getPayables(params?: {
  supplier_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ payables: Payable[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin
    .from('payables')
    .select('*, suppliers(name, company)', { count: 'exact' });

  if (params?.supplier_id) query = query.eq('supplier_id', params.supplier_id);
  if (params?.status) query = query.eq('status', params.status);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch payables: ${error.message}`);

  return {
    payables: (data as Payable[]) || [],
    total: count || 0,
  };
}
