import React from 'react';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../services/dashboardService';

export const BusinessOverviewCard: React.FC = () => {
  const { categoryBreakdown, stats } = useData();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Business Overview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Revenue contribution across service & sales streams
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Revenue</span>
            <span className="text-sm font-black text-[#087443] font-mono">{formatINR(stats.total_income)}</span>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 mb-6">
          {categoryBreakdown.map((item, idx) => (
            <div
              key={idx}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color
              }}
              className="h-full transition-all duration-500"
              title={`${item.name}: ${item.percentage}% (${formatINR(item.revenue)})`}
            />
          ))}
        </div>

        {/* Category List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoryBreakdown.map((item, idx) => (
            <div 
              key={idx}
              className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {item.name}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {formatINR(item.revenue)}
                </span>
                <span className="text-[10.5px] text-slate-400 font-medium ml-1.5">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{stats.total_income > 0 ? 'Revenue distributed by stream' : 'No sales recorded yet'}</span>
        <span className="text-emerald-700 font-semibold">
          {stats.total_income > 0 ? 'Live Inflow Stream' : 'Ready for billing'}
        </span>
      </div>
    </div>
  );
};
