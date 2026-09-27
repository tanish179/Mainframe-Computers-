import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR } from '../services/dashboardService';
import { Transaction } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Download, 
  Plus, 
  Filter
} from 'lucide-react';

interface TransactionsViewProps {
  onOpenAddTransaction: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenAddTransaction }) => {
  const { transactions } = useData();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories: string[] = Array.from(new Set(transactions.map((t: Transaction) => t.category)));

  const filtered: Transaction[] = transactions.filter((t: Transaction) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.customer_name && t.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (t.supplier_name && t.supplier_name.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Payment Method', 'Amount', 'Status'];
    const rows = filtered.map((t: Transaction) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.payment_method,
      t.amount,
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mainframe_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFilteredIncome = filtered.filter((t: Transaction) => t.type === 'income').reduce((s: number, t: Transaction) => s + t.amount, 0);
  const totalFilteredExpense = filtered.filter((t: Transaction) => t.type === 'expense').reduce((s: number, t: Transaction) => s + t.amount, 0);

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Financial Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Complete business ledger for sales, services, parts purchases and operating costs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Mini Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Filtered Inflow</span>
          <div className="text-xl font-black text-[#087443] mt-1 font-mono">
            +{formatINR(totalFilteredIncome)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Filtered Outflow</span>
          <div className="text-xl font-black text-slate-800 mt-1 font-mono">
            -{formatINR(totalFilteredExpense)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Filtered Net Margin</span>
          <div className="text-xl font-black text-emerald-700 mt-1 font-mono">
            {formatINR(totalFilteredIncome - totalFilteredExpense)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description, customer or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Type filters */}
          <div className="inline-flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-md transition-all ${filterType === 'income' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-500'}`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-md transition-all ${filterType === 'expense' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
            >
              Expenses
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#087443]"
          >
            <option value="all">All Categories</option>
            {categories.map((c: string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t: Transaction) => {
                const isIncome = t.type === 'income';
                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-500 whitespace-nowrap">
                      {t.date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{t.description}</div>
                      {t.notes && <div className="text-[10px] text-slate-400 font-normal mt-0.5">{t.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium">
                      <span className={`inline-flex items-center gap-1 ${isIncome ? 'text-[#087443]' : 'text-slate-600'}`}>
                        {isIncome ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />}
                        <span className="capitalize">{t.type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 uppercase font-mono text-[11px] whitespace-nowrap">
                      {t.payment_method}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-black font-mono text-[13px] whitespace-nowrap ${isIncome ? 'text-[#087443]' : 'text-slate-800'}`}>
                      {isIncome ? `+${formatINR(t.amount)}` : `-${formatINR(t.amount)}`}
                    </td>
                    <td className="py-3.5 px-6 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-[#087443] border border-emerald-200">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions found matching your search and filter criteria.
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
