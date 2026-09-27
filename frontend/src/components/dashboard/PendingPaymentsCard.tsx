import React from 'react';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../services/dashboardService';
import { Clock, CreditCard, ChevronRight, AlertCircle } from 'lucide-react';

interface PendingPaymentsCardProps {
  onRecordPaymentClick: (pendingItem?: any) => void;
  onViewAllClick: () => void;
}

export const PendingPaymentsCard: React.FC<PendingPaymentsCardProps> = ({
  onRecordPaymentClick,
  onViewAllClick
}) => {
  const { pendingPayments } = useData();

  const previewList = pendingPayments.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Pending Payments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Outstanding receivables due for collection
            </p>
          </div>
          <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
            {pendingPayments.length} pending
          </span>
        </div>

        <div className="space-y-3">
          {previewList.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {item.customer}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                    {item.invoice}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                  <span>Due: <strong className="text-slate-700">{item.due_date}</strong></span>
                  <span>•</span>
                  <span className="text-orange-600 font-medium">{item.status}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-slate-900 font-mono">
                  {formatINR(item.amount)}
                </div>
                <button
                  onClick={() => onRecordPaymentClick(item)}
                  className="mt-1 text-[11px] font-bold text-[#087443] hover:text-[#065F37] hover:underline"
                >
                  Pay Now
                </button>
              </div>
            </div>
          ))}

          {pendingPayments.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No pending customer payments! All clear.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          View All Receivables
        </button>

        <button
          onClick={() => onRecordPaymentClick()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold shadow-2xs transition-all"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Record Payment</span>
        </button>
      </div>
    </div>
  );
};
