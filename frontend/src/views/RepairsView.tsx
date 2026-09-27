import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR } from '../services/dashboardService';
import { ServiceJob, ServiceJobStatus } from '../types';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Laptop, 
  Monitor, 
  Printer, 
  Shield, 
  Clock, 
  Kanban, 
  List,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface RepairsViewProps {
  onOpenNewRepair: () => void;
  onSelectRepair: (job: ServiceJob) => void;
}

export const RepairsView: React.FC<RepairsViewProps> = ({
  onOpenNewRepair,
  onSelectRepair
}) => {
  const { serviceJobs } = useData();
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const filtered: ServiceJob[] = serviceJobs.filter((j: ServiceJob) => {
    const matchesSearch = j.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      j.brand.toLowerCase().includes(search.toLowerCase()) ||
      j.model.toLowerCase().includes(search.toLowerCase()) ||
      j.job_number.toLowerCase().includes(search.toLowerCase()) ||
      j.problem_description.toLowerCase().includes(search.toLowerCase());

    const matchesDevice = deviceFilter === 'all' || j.device_type.toLowerCase() === deviceFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || j.repair_status === statusFilter;

    return matchesSearch && matchesDevice && matchesStatus;
  });

  const activeCount = serviceJobs.filter((j: ServiceJob) => j.repair_status !== 'delivered' && j.repair_status !== 'cancelled').length;
  const readyCount = serviceJobs.filter((j: ServiceJob) => j.repair_status === 'ready').length;
  const waitingPartsCount = serviceJobs.filter((j: ServiceJob) => j.repair_status === 'waiting_for_part').length;

  const kanbanColumns: { status: ServiceJobStatus; label: string; color: string }[] = [
    { status: 'received', label: 'Received & Intake', color: 'bg-slate-100 text-slate-700' },
    { status: 'diagnosing', label: 'Diagnosis Bench', color: 'bg-purple-100 text-purple-800' },
    { status: 'waiting_for_part', label: 'Awaiting Spares', color: 'bg-amber-100 text-amber-800' },
    { status: 'in_repair', label: 'In Repair', color: 'bg-blue-100 text-blue-800' },
    { status: 'ready', label: 'Ready for Customer', color: 'bg-emerald-100 text-emerald-800' },
    { status: 'delivered', label: 'Delivered & Handed Over', color: 'bg-slate-200 text-slate-800' }
  ];

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Repair & Service Jobs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Track hardware diagnostics, component replacements, status updates and delivery handovers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-2xs text-[#087443]' : 'text-slate-500'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-2xs text-[#087443]' : 'text-slate-500'}`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewRepair}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ New Service Job</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active In Bench</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Ready For Pickup</span>
          <div className="text-2xl font-black text-[#087443] mt-1">{readyCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Awaiting Parts</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{waitingPartsCount}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Logged</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{serviceJobs.length}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search job #, customer, brand, issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#087443]"
          >
            <option value="all">All Devices</option>
            <option value="laptop">Laptops</option>
            <option value="desktop">Desktops</option>
            <option value="printer">Printers</option>
            <option value="cctv">CCTV</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#087443]"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="diagnosing">Diagnosing</option>
            <option value="waiting_for_part">Waiting for Parts</option>
            <option value="in_repair">In Repair</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Render Mode: Table or Kanban */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Job ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Hardware</th>
                  <th className="py-3.5 px-4">Reported Issue</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Delivery</th>
                  <th className="py-3.5 px-6 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((job: ServiceJob) => (
                  <tr
                    key={job.id}
                    onClick={() => onSelectRepair(job)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {job.job_number}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{job.customer_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{job.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{job.brand} {job.model}</div>
                      <div className="text-[11px] text-slate-500">{job.device_type}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {job.problem_description}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold capitalize ${
                        job.repair_status === 'ready'
                          ? 'bg-emerald-50 text-[#087443] border border-emerald-200'
                          : job.repair_status === 'in_repair'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : job.repair_status === 'waiting_for_part'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                      }`}>
                        {job.repair_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600">
                      {job.expected_date}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap font-mono font-black text-slate-900">
                      {formatINR(job.final_cost || job.estimated_cost)}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="text-sm font-semibold text-slate-600 mb-1">No service jobs found</div>
                      <div className="text-xs text-slate-400">Click "+ New Service Job" to log an intake.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const columnJobs = filtered.filter((j: ServiceJob) => j.repair_status === col.status);
            return (
              <div key={col.status} className="bg-slate-100/60 rounded-2xl p-3 border border-slate-200 flex flex-col min-w-[220px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                    {columnJobs.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {columnJobs.map((job: ServiceJob) => (
                    <div
                      key={job.id}
                      onClick={() => onSelectRepair(job)}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>{job.job_number}</span>
                        <span className="font-bold text-slate-900">{formatINR(job.final_cost || job.estimated_cost)}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {job.customer_name}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-0.5">
                        {job.brand} {job.model}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                        <span>Due: {job.expected_date}</span>
                      </div>
                    </div>
                  ))}

                  {columnJobs.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
