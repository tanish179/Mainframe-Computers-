import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../services/dashboardService';
import { ArrowUpRight, ArrowDownRight, Search, Filter, ExternalLink } from 'lucide-react';
import { NavTab } from '../../types';

interface RecentTransactionsProps {
  onNavigateToTab?: (tab: NavTab) => void;
  onOpenAddTransaction?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  onNavigateToTab,
  onOpenAddTransaction
}) => {
  const { transactions } = useData();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filtered = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  }).slice(0, 7);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="p-5 sm:p-6 border-b border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial movement across sales, repairs and operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter Pills */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterType === 'income'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterType === 'expense'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Expenses
            </button>
          </div>

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-bold text-[#087443] hover:text-[#065F37] flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <span>View Full Ledger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-[#F1F5F9] text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 sm:px-6">Date</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Method</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {filtered.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Date */}
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-500 whitespace-nowrap">
                    {tx.date}
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                    {tx.description}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {tx.category}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                      isIncome ? 'text-[#087443]' : 'text-slate-600'
                    }`}>
                      {isIncome ? (
                        <>
                          <ArrowDownRight className="w-3.5 h-3.5 text-[#087443]" />
                          <span>Income</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>Expense</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 text-slate-600 uppercase font-mono text-[11px] whitespace-nowrap">
                    {tx.payment_method}
                  </td>

                  {/* Amount with subtle positive/negative indicator */}
                  <td className={`py-3.5 px-4 text-right font-bold whitespace-nowrap font-mono text-[13px] ${
                    isIncome ? 'text-[#087443]' : 'text-slate-800'
                  }`}>
                    {isIncome ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                      tx.status === 'Paid'
                        ? 'bg-emerald-50 text-[#087443] border border-emerald-200/60'
                        : tx.status === 'Pending'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                          : 'bg-blue-50 text-blue-800 border border-blue-200/60'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="text-sm font-semibold text-slate-600 mb-1">No transactions recorded yet</div>
                  <div className="text-xs text-slate-400">Click "+ Add Transaction" above or use Quick Actions to log your first sale or expense.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
