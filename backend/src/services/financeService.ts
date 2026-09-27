import { supabaseAdmin } from '../config/supabase.js';
import { expenseSchema } from '../schemas/index.js';
import { Expense, Transaction } from '../types/database.types.js';
import { logActivity } from './activityService.js';

export type DateRangePeriod =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export function getDateRangeBounds(
  period: DateRangePeriod,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string } {
  const now = new Date();

  if (period === 'custom' && customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd };
  }

  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this_week': {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'this_month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last_month':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      end.setDate(0); // Last day of previous month
      end.setHours(23, 59, 59, 999);
      break;
    case 'this_year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export async function createExpense(input: unknown, userId?: string): Promise<Expense> {
  const validated = expenseSchema.parse(input);

  const { data: expense, error: expErr } = await supabaseAdmin
    .from('expenses')
    .insert([
      {
        category: validated.category,
        description: validated.description,
        amount: validated.amount,
        vendor: validated.vendor || null,
        payment_method: validated.payment_method,
        expense_date: validated.expense_date || new Date().toISOString().split('T')[0],
        reference: validated.reference || null,
        status: validated.status || 'paid',
        notes: validated.notes || null,
        created_by: userId || null,
      },
    ])
    .select()
    .single();

  if (expErr) throw new Error(`Failed to record expense: ${expErr.message}`);

  // Create financial transaction if paid
  if (validated.status === 'paid') {
    await supabaseAdmin.from('transactions').insert([
      {
        type: 'expense',
        amount: validated.amount,
        reference_type: 'expense',
        reference_id: expense.id,
        description: `Expense (${validated.category}): ${validated.description}`,
        payment_method: validated.payment_method,
        status: 'completed',
      },
    ]);
  }

  await logActivity({
    user_id: userId,
    action: 'Expense Created',
    entity_type: 'expense',
    entity_id: expense.id,
    metadata: { category: validated.category, amount: validated.amount },
  });

  return expense as Expense;
}

export async function getExpenses(params?: {
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ expenses: Expense[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin.from('expenses').select('*', { count: 'exact' });

  if (params?.category) query = query.eq('category', params.category);
  if (params?.startDate) query = query.gte('expense_date', params.startDate.split('T')[0]);
  if (params?.endDate) query = query.lte('expense_date', params.endDate.split('T')[0]);

  const { data, count, error } = await query
    .order('expense_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);

  return {
    expenses: (data as Expense[]) || [],
    total: count || 0,
  };
}

export async function getTransactions(params?: {
  type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ transactions: Transaction[]; total: number }> {
  const limit = params?.limit || 50;
  const offset = params?.offset || 0;

  let query = supabaseAdmin.from('transactions').select('*', { count: 'exact' });

  if (params?.type) query = query.eq('type', params.type);
  if (params?.startDate) query = query.gte('transaction_date', params.startDate);
  if (params?.endDate) query = query.lte('transaction_date', params.endDate);

  const { data, count, error } = await query
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);

  return {
    transactions: (data as Transaction[]) || [],
    total: count || 0,
  };
}

export async function calculateProfit(
  period: DateRangePeriod = 'this_month',
  customStart?: string,
  customEnd?: string
): Promise<{
  period: DateRangePeriod;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  profit: number;
}> {
  const { startDate, endDate } = getDateRangeBounds(period, customStart, customEnd);

  // Income transactions
  const { data: incomeData } = await supabaseAdmin
    .from('transactions')
    .select('amount')
    .eq('type', 'income')
    .eq('status', 'completed')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  // Expense transactions
  const { data: expenseData } = await supabaseAdmin
    .from('transactions')
    .select('amount')
    .eq('type', 'expense')
    .eq('status', 'completed')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  const totalIncome = (incomeData || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = (expenseData || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const profit = totalIncome - totalExpenses;

  return {
    period,
    startDate,
    endDate,
    totalIncome,
    totalExpenses,
    profit,
  };
}

export async function calculateCashFlow(
  period: DateRangePeriod = 'this_month',
  customStart?: string,
  customEnd?: string
): Promise<{
  period: DateRangePeriod;
  startDate: string;
  endDate: string;
  moneyIn: number;
  moneyOut: number;
  netCashFlow: number;
}> {
  const { startDate, endDate } = getDateRangeBounds(period, customStart, customEnd);

  // Money In: completed payments
  const { data: paymentsData } = await supabaseAdmin
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('payment_date', startDate)
    .lte('payment_date', endDate);

  // Money Out: paid expenses
  const { data: expensesData } = await supabaseAdmin
    .from('expenses')
    .select('amount')
    .eq('status', 'paid')
    .gte('expense_date', startDate.split('T')[0])
    .lte('expense_date', endDate.split('T')[0]);

  const moneyIn = (paymentsData || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const moneyOut = (expensesData || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netCashFlow = moneyIn - moneyOut;

  return {
    period,
    startDate,
    endDate,
    moneyIn,
    moneyOut,
    netCashFlow,
  };
}
