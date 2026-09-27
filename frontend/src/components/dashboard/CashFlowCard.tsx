import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../services/dashboardService';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const CashFlowCard: React.FC = () => {
  const { stats, transactions } = useData();
  const [period, setPeriod] = useState<'This Month' | 'All Time'>('This Month');

  const moneyIn = stats.total_income;
  const moneyOut = stats.total_expenses;
  const netCashFlow = moneyIn - moneyOut;
  const ratio = moneyIn > 0 ? Math.min(100, Math.round((moneyOut / moneyIn) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Cash Flow
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Liquidity & cash velocity
            </p>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#087443]"
          >
            <option value="This Month">This Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        {/* Big Net Cash Number */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Net Cash Flow ({period})
          </div>
          <div className={`text-2xl font-black tracking-tight ${netCashFlow >= 0 ? 'text-[#087443]' : 'text-rose-600'}`}>
            {netCashFlow > 0 ? `+${formatINR(netCashFlow)}` : formatINR(netCashFlow)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {netCashFlow !== 0 
              ? (netCashFlow > 0 ? 'Positive net cash flow' : 'Negative cash flow') 
              : 'Zero net cash movement'}
          </div>
        </div>

        {/* Money In vs Money Out */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium mb-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-[#087443]" /> Money In
            </div>
            <div className="text-lg font-bold text-slate-900">
              {formatINR(moneyIn)}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {moneyIn > 0 ? '100% captured' : 'No inflows recorded'}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" /> Money Out
            </div>
            <div className="text-lg font-bold text-slate-900">
              {formatINR(moneyOut)}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">
              {moneyIn > 0 ? `${ratio}% of inflow` : 'No outflows'}
            </span>
          </div>
        </div>
      </div>

      {/* Cash Flow Progress Ratio */}
      <div>
        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
          <span>Operating Expense Ratio</span>
          <span className="font-bold text-slate-900">{ratio}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-[#087443] h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(0, 100 - ratio))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>Target: &lt; 45%</span>
          <span className="text-emerald-700 font-medium">Optimal Margin</span>
        </div>
      </div>
    </div>
  );
};
