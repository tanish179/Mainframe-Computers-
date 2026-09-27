import { supabaseAdmin } from '../config/supabase.js';
import { BusinessSummary } from '../types/database.types.js';
import { DateRangePeriod, getDateRangeBounds } from './financeService.js';

export async function getBusinessSummary(
  period: DateRangePeriod = 'this_month',
  customStart?: string,
  customEnd?: string
): Promise<BusinessSummary> {
  const { startDate, endDate } = getDateRangeBounds(period, customStart, customEnd);

  // Try calling PostgreSQL RPC first if available
  const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc('get_business_summary', {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (!rpcErr && rpcResult) {
    return rpcResult as BusinessSummary;
  }

  // Fallback TypeScript calculation if RPC fails or local mockup
  const [
    incomeRes,
    expenseRes,
    paymentsRes,
    expensesRes,
    receivablesRes,
    payablesRes,
    overdueInvoicesRes,
    activeJobsRes,
    completedJobsRes,
    salesRes,
    customersRes,
    lowStockRes,
  ] = await Promise.all([
    supabaseAdmin.from('transactions').select('amount').eq('type', 'income').eq('status', 'completed').gte('transaction_date', startDate).lte('transaction_date', endDate),
    supabaseAdmin.from('transactions').select('amount').eq('type', 'expense').eq('status', 'completed').gte('transaction_date', startDate).lte('transaction_date', endDate),
    supabaseAdmin.from('payments').select('amount').eq('status', 'completed').gte('payment_date', startDate).lte('payment_date', endDate),
    supabaseAdmin.from('expenses').select('amount').eq('status', 'paid').gte('expense_date', startDate.split('T')[0]).lte('expense_date', endDate.split('T')[0]),
    supabaseAdmin.from('receivables').select('remaining_amount').in('status', ['pending', 'partially_paid', 'overdue']),
    supabaseAdmin.from('payables').select('remaining_amount').in('status', ['pending', 'partially_paid', 'overdue']),
    supabaseAdmin.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
    supabaseAdmin.from('service_jobs').select('id', { count: 'exact', head: true }).in('status', ['received', 'diagnosing', 'waiting_for_customer', 'waiting_for_part', 'in_repair', 'ready']),
    supabaseAdmin.from('service_jobs').select('id', { count: 'exact', head: true }).eq('status', 'delivered').gte('updated_at', startDate).lte('updated_at', endDate),
    supabaseAdmin.from('sales').select('id', { count: 'exact', head: true }).in('status', ['confirmed', 'completed']).gte('sale_date', startDate).lte('sale_date', endDate),
    supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('products').select('id, stock_quantity, minimum_stock_level').eq('status', 'active'),
  ]);

  const totalIncome = (incomeRes.data || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalExpenses = (expenseRes.data || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const cashIn = (paymentsRes.data || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const cashOut = (expensesRes.data || []).reduce((sum, ex) => sum + Number(ex.amount || 0), 0);
  const receivablesTotal = (receivablesRes.data || []).reduce((sum, r) => sum + Number(r.remaining_amount || 0), 0);
  const payablesTotal = (payablesRes.data || []).reduce((sum, p) => sum + Number(p.remaining_amount || 0), 0);
  const lowStockCount = (lowStockRes.data || []).filter((p) => (p.stock_quantity || 0) <= (p.minimum_stock_level || 0)).length;

  return {
    total_income: totalIncome,
    total_expenses: totalExpenses,
    profit: totalIncome - totalExpenses,
    cash_in: cashIn,
    cash_out: cashOut,
    receivables: receivablesTotal,
    payables: payablesTotal,
    pending_payments: receivablesTotal,
    overdue_invoices: overdueInvoicesRes.count || 0,
    active_service_jobs: activeJobsRes.count || 0,
    completed_service_jobs: completedJobsRes.count || 0,
    total_sales: salesRes.count || 0,
    total_customers: customersRes.count || 0,
    low_stock_items: lowStockCount,
  };
}
