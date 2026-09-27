import { 
  Transaction, 
  ServiceJob, 
  Product, 
  PendingPayment, 
  FinancialStats, 
  MonthlyChartData, 
  RevenueCategoryBreakdown 
} from '../types';

export function calculateFinancialStats(
  transactions: Transaction[],
  pendingPayments: PendingPayment[]
): FinancialStats {
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const pendingPaymentsTotal = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingCustomersCount = pendingPayments.length;

  return {
    total_income: totalIncome,
    income_growth_pct: 0,
    total_expenses: totalExpenses,
    expense_growth_pct: 0,
    net_profit: netProfit,
    profit_growth_pct: 0,
    pending_payments_total: pendingPaymentsTotal,
    pending_customers_count: pendingCustomersCount,
  };
}

export function calculateMonthlyTrends(transactions: Transaction[]): MonthlyChartData[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0 to 11
  
  // Last 6 months up to current month
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const idx = (currentMonthIdx - i + 12) % 12;
    months.push(monthNames[idx]);
  }

  const monthlyTotals: Record<string, { income: number; expenses: number }> = {};
  months.forEach(m => {
    monthlyTotals[m] = { income: 0, expenses: 0 };
  });

  // Calculate purely from actual transactions
  transactions.forEach(t => {
    if (t.status === 'Paid') {
      const dateStr = t.created_at || t.date || '';
      for (const m of months) {
        if (dateStr.includes(m)) {
          if (t.type === 'income') {
            monthlyTotals[m].income += t.amount;
          } else if (t.type === 'expense') {
            monthlyTotals[m].expenses += t.amount;
          }
          break;
        }
      }
    }
  });

  return months.map(m => {
    const inc = monthlyTotals[m].income;
    const exp = monthlyTotals[m].expenses;
    return {
      month: m,
      income: inc,
      expenses: exp,
      profit: inc - exp
    };
  });
}

export function calculateRevenueCategories(transactions: Transaction[]): RevenueCategoryBreakdown[] {
  const incomeTx = transactions.filter(t => t.type === 'income' && t.status === 'Paid');
  const total = incomeTx.reduce((sum, t) => sum + t.amount, 0);

  const categoryBuckets: Record<string, { revenue: number; color: string }> = {
    'PC Builds & Sales': { revenue: 0, color: '#087443' },
    'Repairs & Services': { revenue: 0, color: '#0EA5E9' },
    'Refurbished Laptops': { revenue: 0, color: '#8B5CF6' },
    'CCTV & Security': { revenue: 0, color: '#F59E0B' },
    'Accessories & Inks': { revenue: 0, color: '#10B981' },
    'Other IT Services': { revenue: 0, color: '#64748B' }
  };

  incomeTx.forEach(t => {
    const cat = t.category.toLowerCase();
    if (cat.includes('pc build') || cat.includes('desktop sale')) {
      categoryBuckets['PC Builds & Sales'].revenue += t.amount;
    } else if (cat.includes('repair') || cat.includes('screen') || cat.includes('panel')) {
      categoryBuckets['Repairs & Services'].revenue += t.amount;
    } else if (cat.includes('refurb') || cat.includes('laptop sale')) {
      categoryBuckets['Refurbished Laptops'].revenue += t.amount;
    } else if (cat.includes('cctv')) {
      categoryBuckets['CCTV & Security'].revenue += t.amount;
    } else if (cat.includes('cartridge') || cat.includes('accessory') || cat.includes('accessories') || cat.includes('sales')) {
      categoryBuckets['Accessories & Inks'].revenue += t.amount;
    } else {
      categoryBuckets['Other IT Services'].revenue += t.amount;
    }
  });

  return Object.entries(categoryBuckets).map(([name, data]) => ({
    name,
    revenue: data.revenue,
    percentage: total > 0 ? Math.round((data.revenue / total) * 100) : 0,
    color: data.color
  }));
}

export function getActiveRepairsCount(jobs: ServiceJob[]): number {
  return jobs.filter(j => j.repair_status !== 'delivered' && j.repair_status !== 'cancelled').length;
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter(p => p.stock_quantity <= p.minimum_stock);
}

// Indian currency formatter: ₹1,24,500
export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
}
