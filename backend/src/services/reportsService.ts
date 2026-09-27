import { supabaseAdmin } from '../config/supabase.js';
import { DateRangePeriod, calculateCashFlow, calculateProfit, getDateRangeBounds } from './financeService.js';

export interface ReportFilter {
  period?: DateRangePeriod;
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  customer_id?: string;
  supplier_id?: string;
  limit?: number;
  offset?: number;
}

export async function getSalesReport(filter?: ReportFilter) {
  const { startDate, endDate } = getDateRangeBounds(filter?.period || 'this_month', filter?.startDate, filter?.endDate);

  let query = supabaseAdmin
    .from('sales')
    .select('*, customers(name, phone), sale_items(*, products(name, sku))')
    .gte('sale_date', startDate)
    .lte('sale_date', endDate);

  if (filter?.customer_id) query = query.eq('customer_id', filter.customer_id);
  if (filter?.status) query = query.eq('status', filter.status);

  const { data, error } = await query.order('sale_date', { ascending: false });

  if (error) throw new Error(`Failed to generate sales report: ${error.message}`);

  const sales = data || [];
  const totalSalesAmount = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discount || 0), 0);

  return {
    title: 'Sales Report',
    period: filter?.period || 'this_month',
    startDate,
    endDate,
    summary: {
      count: sales.length,
      totalSalesAmount,
      totalDiscount,
      averageSaleValue: sales.length ? totalSalesAmount / sales.length : 0,
    },
    data: sales,
  };
}

export async function getServiceReport(filter?: ReportFilter) {
  const { startDate, endDate } = getDateRangeBounds(filter?.period || 'this_month', filter?.startDate, filter?.endDate);

  let query = supabaseAdmin
    .from('service_jobs')
    .select('*, customers(name, phone), employees(name)')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (filter?.status) query = query.eq('status', filter.status);
  if (filter?.customer_id) query = query.eq('customer_id', filter.customer_id);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to generate service report: ${error.message}`);

  const jobs = data || [];
  const totalEstimated = jobs.reduce((sum, j) => sum + Number(j.estimated_cost || 0), 0);
  const totalFinalCost = jobs.reduce((sum, j) => sum + Number(j.final_cost || 0), 0);
  const totalAdvancePaid = jobs.reduce((sum, j) => sum + Number(j.advance_paid || 0), 0);

  return {
    title: 'Service Jobs Report',
    period: filter?.period || 'this_month',
    startDate,
    endDate,
    summary: {
      totalJobs: jobs.length,
      completedJobs: jobs.filter((j) => j.status === 'delivered').length,
      pendingJobs: jobs.filter((j) => ['received', 'diagnosing', 'in_repair', 'ready'].includes(j.status)).length,
      totalRevenue: totalFinalCost,
      totalAdvancePaid,
      averageRepairValue: jobs.length ? totalFinalCost / jobs.length : 0,
    },
    data: jobs,
  };
}

export async function getIncomeReport(filter?: ReportFilter) {
  const { startDate, endDate } = getDateRangeBounds(filter?.period || 'this_month', filter?.startDate, filter?.endDate);

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('type', 'income')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false });

  if (error) throw new Error(`Failed to generate income report: ${error.message}`);

  const items = data || [];
  const totalIncome = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  return {
    title: 'Income Report',
    startDate,
    endDate,
    summary: { count: items.length, totalIncome },
    data: items,
  };
}

export async function getExpenseReport(filter?: ReportFilter) {
  const { startDate, endDate } = getDateRangeBounds(filter?.period || 'this_month', filter?.startDate, filter?.endDate);

  let query = supabaseAdmin
    .from('expenses')
    .select('*')
    .gte('expense_date', startDate.split('T')[0])
    .lte('expense_date', endDate.split('T')[0]);

  if (filter?.category) query = query.eq('category', filter.category);

  const { data, error } = await query.order('expense_date', { ascending: false });

  if (error) throw new Error(`Failed to generate expense report: ${error.message}`);

  const expenses = data || [];
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return {
    title: 'Expense Report',
    startDate,
    endDate,
    summary: { count: expenses.length, totalExpenses },
    data: expenses,
  };
}

export async function getProfitReport(filter?: ReportFilter) {
  return await calculateProfit(filter?.period || 'this_month', filter?.startDate, filter?.endDate);
}

export async function getCashFlowReport(filter?: ReportFilter) {
  return await calculateCashFlow(filter?.period || 'this_month', filter?.startDate, filter?.endDate);
}

export async function getReceivablesReport(filter?: ReportFilter) {
  let query = supabaseAdmin
    .from('receivables')
    .select('*, customers(name, phone), invoices(invoice_number)');

  if (filter?.customer_id) query = query.eq('customer_id', filter.customer_id);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to generate receivables report: ${error.message}`);

  const receivables = data || [];
  const totalRemaining = receivables.reduce((sum, r) => sum + Number(r.remaining_amount || 0), 0);

  return {
    title: 'Receivables Report',
    summary: {
      count: receivables.length,
      totalOutstanding: totalRemaining,
    },
    data: receivables,
  };
}

export async function getPayablesReport(filter?: ReportFilter) {
  let query = supabaseAdmin
    .from('payables')
    .select('*, suppliers(name, company)');

  if (filter?.supplier_id) query = query.eq('supplier_id', filter.supplier_id);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to generate payables report: ${error.message}`);

  const payables = data || [];
  const totalRemaining = payables.reduce((sum, p) => sum + Number(p.remaining_amount || 0), 0);

  return {
    title: 'Payables Report',
    summary: {
      count: payables.length,
      totalOutstanding: totalRemaining,
    },
    data: payables,
  };
}

export async function getInventoryReport(filter?: ReportFilter) {
  let query = supabaseAdmin.from('products').select('*');

  if (filter?.category) query = query.eq('category', filter.category);

  const { data, error } = await query.order('name', { ascending: true });

  if (error) throw new Error(`Failed to generate inventory report: ${error.message}`);

  const products = data || [];
  const lowStock = products.filter((p) => p.stock_quantity <= p.minimum_stock_level);
  const totalStockValue = products.reduce((sum, p) => sum + (Number(p.purchase_price || 0) * (p.stock_quantity || 0)), 0);

  return {
    title: 'Inventory Report',
    summary: {
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      totalInventoryValue: totalStockValue,
    },
    data: products,
    lowStockProducts: lowStock,
  };
}

export async function getCustomerReport() {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*, sales(total), service_jobs(final_cost)')
    .order('name', { ascending: true });

  if (error) throw new Error(`Failed to generate customer report: ${error.message}`);

  return {
    title: 'Customer Report',
    summary: { totalCustomers: (data || []).length },
    data: data || [],
  };
}

export async function getServiceJobReport(filter?: ReportFilter) {
  return await getServiceReport(filter);
}
