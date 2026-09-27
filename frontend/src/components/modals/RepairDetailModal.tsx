import React from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { ServiceJob, ServiceJobStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../services/dashboardService';
import { 
  Wrench, 
  Printer, 
  Phone, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Tag
} from 'lucide-react';

interface RepairDetailModalProps {
  job: ServiceJob | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RepairDetailModal: React.FC<RepairDetailModalProps> = ({ job, isOpen, onClose }) => {
  const { updateRepairStatus } = useData();

  if (!job) return null;

  const handleStatusChange = (newStatus: ServiceJobStatus) => {
    updateRepairStatus(job.id, newStatus);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title={`Job Order: ${job.job_number}`}
      subtitle="Mainframe Computers Service Ticket"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Status Tracker Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Repair Status
              </span>
              <div className="text-base font-bold text-slate-900 capitalize">
                {job.repair_status.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Quick status selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Update to:</span>
              <select
                value={job.repair_status}
                onChange={(e) => handleStatusChange(e.target.value as ServiceJobStatus)}
                className="text-xs font-bold text-[#087443] bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#087443]"
              >
                <option value="received">Received</option>
                <option value="diagnosing">Diagnosing</option>
                <option value="waiting_for_part">Waiting for Parts</option>
                <option value="in_repair">In Repair</option>
                <option value="ready">Ready for Pickup</option>
                <option value="delivered">Delivered & Closed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
            <span>Assigned: <strong className="text-slate-800">{job.assigned_staff || 'Mainframe Team'}</strong></span>
            <span>Target Delivery: <strong className="text-slate-800">{job.expected_date}</strong></span>
          </div>
        </div>

        {/* Customer & Device Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" /> Customer Details
            </h4>
            <div className="text-sm font-bold text-slate-900">{job.customer_name}</div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-mono">
              <Phone className="w-3 h-3 text-slate-400" /> {job.customer_phone}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Customer ID: {job.customer_id}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-500" /> Hardware Under Service
            </h4>
            <div className="text-sm font-bold text-slate-900">
              {job.brand} {job.model}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Type: <span className="font-semibold text-slate-800">{job.device_type}</span>
            </div>
            {job.serial_number && (
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                S/N: {job.serial_number}
              </div>
            )}
          </div>
        </div>

        {/* Problem & Diagnosis */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
              Customer Reported Issue
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {job.problem_description}
            </p>
          </div>

          {job.diagnosis && (
            <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/30">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                Technician Diagnosis & Inspection
              </span>
              <p className="text-xs text-slate-800 leading-relaxed">
                {job.diagnosis}
              </p>
            </div>
          )}

          {job.technician_notes && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Bench Notes
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {job.technician_notes}
              </p>
            </div>
          )}
        </div>

        {/* Billing breakdown */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Financial & Payment Status
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold block">Total Cost</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">
                {formatINR(job.final_cost || job.estimated_cost)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-800 font-semibold block">Advance Paid</span>
              <span className="text-base font-extrabold text-[#087443] font-mono">
                {formatINR(job.advance_paid)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200">
              <span className="text-[10px] text-orange-800 font-semibold block">Remaining Due</span>
              <span className="text-base font-extrabold text-orange-700 font-mono">
                {formatINR(job.remaining_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Job Ticket</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};
