import React from 'react';
import { useData } from '../../context/DataContext';
import { Clock, CheckCircle2, Circle, Calendar, Wrench, Shield, Truck, PhoneCall, Cpu } from 'lucide-react';

export const TodayWorkCard: React.FC = () => {
  const { todayTasks, toggleTaskStatus } = useData();

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'repair':
        return <Wrench className="w-3.5 h-3.5 text-blue-600" />;
      case 'cctv':
        return <Shield className="w-3.5 h-3.5 text-purple-600" />;
      case 'delivery':
        return <Truck className="w-3.5 h-3.5 text-amber-600" />;
      case 'followup':
        return <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />;
      case 'pc_build':
        return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Today's Work & Schedule
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled dispatches, on-site jobs & deliveries
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-[#087443]" />
            <span>Today, Kolhapur</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {todayTasks.map((t) => {
            const isCompleted = t.status === 'completed';

            return (
              <div
                key={t.id}
                onClick={() => toggleTaskStatus(t.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button 
                    className="text-slate-400 hover:text-[#087443] transition-colors"
                    title={isCompleted ? "Mark incomplete" : "Mark done"}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#087443]" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </button>

                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {getTaskIcon(t.type)}
                  </div>

                  <div className="min-w-0">
                    <div className={`text-xs font-bold text-slate-900 truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Client: <span className="font-medium text-slate-700">{t.client}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 bg-slate-100">
                    {t.time}
                  </span>
                </div>
              </div>
            );
          })}

          {todayTasks.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No tasks scheduled for today.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Click any task to toggle complete</span>
        <span className="font-semibold text-[#087443]">
          {todayTasks.filter(t => t.status === 'completed').length} / {todayTasks.length} Done
        </span>
      </div>
    </div>
  );
};
