import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR } from '../services/dashboardService';
import { Transaction } from '../types';
import { Search, Plus } from 'lucide-react';

interface SalesViewProps {
  onOpenAddSale: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ onOpenAddSale }) => {
  const { transactions } = useData();
  const [search, setSearch] = useState('');

  // Filter sales (income transactions)
  const sales: Transaction[] = transactions.filter((t: Transaction) => t.type === 'income');

  const filtered: Transaction[] = sales.filter((s: Transaction) =>
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    (s.customer_name && s.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSalesRevenue = sales.reduce((sum: number, s: Transaction) => sum + s.amount, 0);

  // Compute top payment method dynamically
  const paymentCounts: Record<string, number> = {};
  sales.forEach(s => {
    const method = s.payment_method?.toUpperCase() || 'OTHER';
    paymentCounts[method] = (paymentCounts[method] || 0) + 1;
  });
  const topPaymentMethod = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Sales & POS Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Over-the-counter hardware billing, laptop sales, peripherals and invoice records
          </p>
        </div>

        <button
          onClick={onOpenAddSale}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Customer Sale</span>
        </button>
      </div>

      {/* Mini KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Sales Revenue</span>
          <div className="text-2xl font-black text-[#087443] font-mono mt-1">{formatINR(totalSalesRevenue)}</div>
          <span className="text-[10px] text-slate-500">Across {sales.length} customer orders</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Average Order Value (AOV)</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(Math.round(totalSalesRevenue / (sales.length || 1)))}
          </div>
          <span className="text-[10px] text-slate-500">Per transaction</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Primary Inflow Channel</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{topPaymentMethod || 'UPI / Cash / Card'}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Real-time payment tracking</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sale description, customer, item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-4">Sold Item / Description</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s: Transaction) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-slate-500 whitespace-nowrap">{s.date}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.description}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{s.customer_name || 'Walk-in Store Customer'}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 uppercase font-mono text-[11px] text-slate-600">{s.payment_method}</td>
                  <td className="py-3.5 px-6 text-right font-black font-mono text-[#087443] text-[13px]">
                    +{formatINR(s.amount)}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="text-sm font-semibold text-slate-600 mb-1">No sales records found</div>
                    <div className="text-xs text-slate-400">Click "+ Add Customer Sale" to record a sale.</div>
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
