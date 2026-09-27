import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../services/dashboardService';

export const FinancialCards: React.FC = () => {
  const { stats } = useData();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {/* CARD 1: Total Income */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Income
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#087443] flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {formatINR(stats.total_income)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {stats.income_growth_pct !== 0 ? (
            <span className="inline-flex items-center gap-0.5 font-bold text-[#087443] bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
              <TrendingUp className="w-3 h-3" /> {stats.income_growth_pct > 0 ? `+${stats.income_growth_pct}%` : `${stats.income_growth_pct}%`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50/70 px-2 py-0.5 rounded text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Live ledger
            </span>
          )}
          <span className="text-slate-400 font-medium text-[11px]">• real-time calculations</span>
        </div>
      </div>

      {/* CARD 2: Total Expenses */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {formatINR(stats.total_expenses)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {stats.expense_growth_pct !== 0 ? (
            <span className="inline-flex items-center gap-0.5 font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
              <TrendingUp className="w-3 h-3" /> +{stats.expense_growth_pct}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Operational outflow
            </span>
          )}
          <span className="text-slate-400 font-medium text-[11px]">• recorded expenses</span>
        </div>
      </div>

      {/* CARD 3: Net Profit */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Profit
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#087443]/10 text-[#087443] flex items-center justify-center">
            <Wallet className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${stats.net_profit >= 0 ? 'text-[#087443]' : 'text-rose-600'}`}>
          {formatINR(stats.net_profit)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {stats.profit_growth_pct !== 0 ? (
            <span className="inline-flex items-center gap-0.5 font-bold text-[#087443] bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
              <TrendingUp className="w-3 h-3" /> +{stats.profit_growth_pct}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-[#087443] bg-emerald-50/70 px-2 py-0.5 rounded text-[11px]">
              Income − Expenses
            </span>
          )}
          <span className="text-slate-400 font-medium text-[11px]">• net margin</span>
        </div>
      </div>

      {/* CARD 4: Pending Payments */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Payments
          </span>
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {formatINR(stats.pending_payments_total)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded text-[11px]">
            <AlertCircle className="w-3 h-3" /> {stats.pending_customers_count} customers
          </span>
          <span className="text-slate-400 font-medium">pending follow-up</span>
        </div>
      </div>
    </div>
  );
};
