import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../services/dashboardService';
import { Calendar, ChevronDown, Filter } from 'lucide-react';

export const MainFinancialAnalytics: React.FC = () => {
  const { monthlyTrends } = useData();
  const [selectedRange, setSelectedRange] = useState<'6M' | '3M' | 'YTD'>('6M');

  const displayData = selectedRange === '3M' ? monthlyTrends.slice(-3) : monthlyTrends;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
      {/* Header with Title and Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Income & Expenses
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly financial overview & margin analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="flex items-center gap-4 mr-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#087443]" />
              <span className="text-slate-600 font-medium">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
              <span className="text-slate-600 font-medium">Expenses</span>
            </div>
          </div>

          {/* Time range buttons */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSelectedRange('3M')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedRange === '3M'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setSelectedRange('6M')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedRange === '6M'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setSelectedRange('YTD')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedRange === 'YTD'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              YTD
            </button>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 11 }} 
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: '#F8FAFC' }}
              content={<CustomTooltip />}
            />
            <Bar 
              dataKey="income" 
              name="Income" 
              fill="#087443" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={32}
            />
            <Bar 
              dataKey="expenses" 
              name="Expenses" 
              fill="#CBD5E1" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
    const net = income - expenses;

    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800 min-w-44">
        <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex justify-between">
          <span>{label} 2026</span>
          <span className="text-emerald-400 font-mono">Net: {formatINR(net)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#087443]" /> Income:
          </span>
          <span className="font-semibold text-white font-mono">{formatINR(income)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Expenses:
          </span>
          <span className="font-semibold text-white font-mono">{formatINR(expenses)}</span>
        </div>
      </div>
    );
  }
  return null;
};
