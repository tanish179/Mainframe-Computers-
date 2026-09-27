import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR } from '../services/dashboardService';
import { Transaction } from '../types';
import { Search, Plus } from 'lucide-react';

interface ExpensesViewProps {
  onOpenAddExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAddExpense }) => {
  const { transactions } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const expenses: Transaction[] = transactions.filter((t: Transaction) => t.type === 'expense');
  const categories: string[] = Array.from(new Set(expenses.map((e: Transaction) => e.category)));

  const filtered: Transaction[] = expenses.filter((e: Transaction) => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalExpenseAmount = expenses.reduce((sum: number, e: Transaction) => sum + e.amount, 0);

  // Dynamic calculation for largest outflow category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topExpenseCategory = sortedCategories[0];

  // Dynamic fixed overhead calculation (rent, electricity, internet, salary)
  const fixedOverhead = expenses
    .filter(e => ['rent', 'electricity', 'internet', 'salary'].some(cat => e.category.toLowerCase().includes(cat)))
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Operating Expenses & Overhead
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Store rent, electricity, technician payroll, supplier payments and tooling expenses
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Record Expense</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Outflow (Current Month)</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(totalExpenseAmount)}
          </div>
          <span className="text-[10px] text-slate-500">Across {expenses.length} expense vouchers</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Largest Outflow Driver</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {topExpenseCategory ? topExpenseCategory[0] : 'None recorded'}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">
            {totalExpenseAmount > 0 && topExpenseCategory 
              ? `${Math.round((topExpenseCategory[1] / totalExpenseAmount) * 100)}% of operational expense` 
              : 'No recorded outflows'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Fixed Monthly Overhead</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(fixedOverhead)}
          </div>
          <span className="text-[10px] text-slate-500">Rent, power, internet & payroll base</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense description, vendor, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-800"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 w-full md:w-auto"
        >
          <option value="all">All Expense Categories</option>
          {categories.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-4">Expense Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e: Transaction) => (
                <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-500 whitespace-nowrap">{e.date}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{e.description}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 uppercase font-mono text-[11px] text-slate-600">{e.payment_method}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">{e.notes || '—'}</td>
                  <td className="py-3.5 px-6 text-right font-black font-mono text-slate-900 text-[13px]">
                    -{formatINR(e.amount)}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="text-sm font-semibold text-slate-600 mb-1">No expense records found</div>
                    <div className="text-xs text-slate-400">Click "+ Record Expense" to log operational costs.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
