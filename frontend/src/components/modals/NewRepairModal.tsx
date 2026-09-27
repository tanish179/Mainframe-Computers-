import React, { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { useData } from '../../context/DataContext';
import { PriorityLevel } from '../../types';

interface NewRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRepairModal: React.FC<NewRepairModalProps> = ({ isOpen, onClose }) => {
  const { newRepair, customers, staff } = useData();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deviceType, setDeviceType] = useState<'Laptop' | 'Desktop' | 'Printer' | 'Monitor' | 'CCTV' | 'Other'>('Laptop');
  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');
  const [expectedDate, setExpectedDate] = useState('Tomorrow');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [assignedStaff, setAssignedStaff] = useState('Amol Pawar (Sr. Tech)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !problemDescription) return;

    const estCostNum = parseFloat(estimatedCost) || 0;
    const advPaidNum = parseFloat(advancePaid) || 0;

    newRepair({
      customer_id: `cust-${Date.now()}`,
      customer_name: customerName,
      customer_phone: customerPhone || '+91 98000 00000',
      device_type: deviceType,
      brand,
      model: model || 'Generic Model',
      serial_number: serialNumber || undefined,
      problem_description: problemDescription,
      repair_status: 'received',
      priority,
      estimated_cost: estCostNum,
      final_cost: estCostNum,
      advance_paid: advPaidNum,
      remaining_amount: Math.max(0, estCostNum - advPaidNum),
      received_date: new Date().toISOString().split('T')[0],
      expected_date: expectedDate,
      assigned_staff: assignedStaff
    });

    onClose();
    setCustomerName('');
    setCustomerPhone('');
    setModel('');
    setProblemDescription('');
    setEstimatedCost('');
    setAdvancePaid('');
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Service Job / Repair"
      subtitle="Generates unique job ticket and records store entry"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Patil"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone *
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98220 12345"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>
        </div>

        {/* Device Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Device Type
            </label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            >
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop PC</option>
              <option value="Printer">Printer / Scanner</option>
              <option value="CCTV">CCTV DVR / NVR</option>
              <option value="Monitor">Monitor</option>
              <option value="Other">Other Device</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              placeholder="e.g. Dell, HP, Lenovo"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Model
            </label>
            <input
              type="text"
              placeholder="e.g. Inspiron 15"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>
        </div>

        {/* Problem Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Customer Reported Problem *
          </label>
          <textarea
            required
            rows={2}
            placeholder="e.g. Screen flickering with green lines; power button not responding"
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        {/* Financials & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estimated Cost (₹)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Advance Paid (₹)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={advancePaid}
              onChange={(e) => setAdvancePaid(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent (Express)</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Assignee & Expected delivery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assign Technician
            </label>
            <select
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            >
              <option value="Amol Pawar (Sr. Tech)">Amol Pawar (Sr. Tech)</option>
              <option value="Sagar Kamble">Sagar Kamble (Hardware)</option>
              <option value="Tanish (Admin)">Tanish (Admin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expected Delivery
            </label>
            <input
              type="text"
              placeholder="e.g. Tomorrow, 5:00 PM"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            Generate Job Card
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
