import React, { useState, useEffect } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { useData } from '../../context/DataContext';
import { PendingPayment } from '../../types';
import { formatINR } from '../../services/dashboardService';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: PendingPayment | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  initialItem
}) => {
  const { pendingPayments, recordPayment } = useData();

  const [selectedPendingId, setSelectedPendingId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    if (initialItem) {
      setSelectedPendingId(initialItem.id);
      setAmountPaid(initialItem.amount.toString());
    } else if (pendingPayments.length > 0 && !selectedPendingId) {
      setSelectedPendingId(pendingPayments[0].id);
      setAmountPaid(pendingPayments[0].amount.toString());
    }
  }, [initialItem, pendingPayments, isOpen]);

  const selectedItem = pendingPayments.find(p => p.id === selectedPendingId);

  const handlePendingChange = (id: string) => {
    setSelectedPendingId(id);
    const item = pendingPayments.find(p => p.id === id);
    if (item) setAmountPaid(item.amount.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPendingId || !amountPaid) return;

    recordPayment(selectedPendingId, parseFloat(amountPaid), paymentMethod);
    onClose();
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Payment"
      subtitle="Collect outstanding dues for invoices or finished repair jobs"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Select Pending Bill / Invoice *
          </label>
          <select
            value={selectedPendingId}
            onChange={(e) => handlePendingChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          >
            {pendingPayments.map(p => (
              <option key={p.id} value={p.id}>
                {p.customer} — {p.invoice} ({formatINR(p.amount)} due)
              </option>
            ))}
          </select>
        </div>

        {selectedItem && (
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-orange-950 block">{selectedItem.customer}</span>
              <span className="text-[11px] text-orange-800">Due date: {selectedItem.due_date}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-orange-800 uppercase font-semibold block">Outstanding Due</span>
              <span className="text-sm font-black text-orange-900 font-mono">
                {formatINR(selectedItem.amount)}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Amount Received (₹) *
          </label>
          <input
            type="number"
            required
            placeholder="0.00"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          >
            <option value="UPI">UPI (Google Pay / PhonePe / QR)</option>
            <option value="cash">Cash In Hand</option>
            <option value="bank_transfer">Direct Bank Transfer</option>
            <option value="card">Card Payment</option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
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
            Confirm & Update Ledger
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
