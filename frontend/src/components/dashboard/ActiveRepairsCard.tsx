import React from 'react';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../services/dashboardService';
import { ServiceJob, ServiceJobStatus } from '../../types';
import { Wrench, Laptop, Monitor, Printer, Shield, ChevronRight } from 'lucide-react';

interface ActiveRepairsCardProps {
  onSelectRepair: (repair: ServiceJob) => void;
  onViewAllRepairs: () => void;
  onNewRepairClick: () => void;
}

export const ActiveRepairsCard: React.FC<ActiveRepairsCardProps> = ({
  onSelectRepair,
  onViewAllRepairs,
  onNewRepairClick
}) => {
  const { serviceJobs } = useData();

  // Active repairs (not delivered)
  const activeJobs = serviceJobs.filter(
    j => j.repair_status !== 'delivered' && j.repair_status !== 'cancelled'
  ).slice(0, 5);

  const getStatusBadge = (status: ServiceJobStatus) => {
    switch (status) {
      case 'received':
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10.5px] font-bold">Received</span>;
      case 'diagnosing':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-full text-[10.5px] font-bold">Diagnosing</span>;
      case 'waiting_for_part':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-full text-[10.5px] font-bold">Waiting for Parts</span>;
      case 'in_repair':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-full text-[10.5px] font-bold">In Repair</span>;
      case 'ready':
        return <span className="bg-emerald-50 text-[#087443] border border-emerald-200/60 px-2 py-0.5 rounded-full text-[10.5px] font-bold">Ready</span>;
      case 'delivered':
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10.5px] font-bold">Delivered</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10.5px] font-bold">{status}</span>;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-emerald-700" />;
      case 'desktop':
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case 'printer':
        return <Printer className="w-4 h-4 text-orange-600" />;
      case 'cctv':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Active Repairs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Work orders currently in diagnostic, queue & bench repair
            </p>
          </div>
          <button
            onClick={onNewRepairClick}
            className="text-xs font-bold text-[#087443] hover:text-[#065F37] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60"
          >
            + New Job
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {activeJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectRepair(job)}
              className="py-3 group cursor-pointer flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 -mx-2 rounded-xl transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  {getDeviceIcon(job.device_type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {job.customer_name}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 truncate">
                      • {job.brand} {job.model}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                    {job.problem_description}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>Due: <strong className="text-slate-600 font-semibold">{job.expected_date}</strong></span>
                    <span>•</span>
                    <span className="font-mono">{job.job_number}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="mb-1.5">
                  {getStatusBadge(job.repair_status)}
                </div>
                <div className="text-xs font-bold text-slate-900 font-mono">
                  {formatINR(job.final_cost || job.estimated_cost)}
                </div>
              </div>
            </div>
          ))}

          {activeJobs.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No active repair jobs in queue!
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onViewAllRepairs}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <span>Open Service Desk</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] text-slate-400">
          Showing top {activeJobs.length} active jobs
        </span>
      </div>
    </div>
  );
};
