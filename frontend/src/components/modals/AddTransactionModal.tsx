import React, { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { useData } from '../../context/DataContext';
import { PaymentMethod, TransactionType } from '../../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction } = useData();

  const [type, setType] = useState<'income' | 'expense'>('income');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Laptop Sale');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [partyName, setPartyName] = useState('');
  const [notes, setNotes] = useState('');

  const incomeCategories = [
    'Laptop Sale', 'Desktop Sale', 'Printer Sale', 'Accessories',
    'Repair Service', 'Printer Repair', 'Cartridge Refill',
    'CCTV Installation', 'PC Build', 'Data Recovery',
    'Formatting / Windows Installation', 'Other Service'
  ];

  const expenseCategories = [
    'Inventory Purchase', 'Supplier Payment', 'Rent', 'Electricity',
    'Internet', 'Transport', 'Salary', 'Marketing', 'Software',
    'Maintenance', 'Tools', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const todayStr = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;
    addTransaction({
      date: todayStr,
      description: partyName ? `${description} (${partyName})` : description,
      category,
      type,
      payment_method: paymentMethod,
      amount: parseFloat(amount),
      status: 'Paid',
      notes
    });

    onClose();
    setDescription('');
    setAmount('');
    setPartyName('');
    setNotes('');
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Add Financial Transaction"
      subtitle="Fast 10-second ledger entry for Mainframe Computers"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Income / Expense Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('Laptop Sale');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-[#087443] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Income (Money In)
          </button>
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('Inventory Purchase');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            - Expense (Money Out)
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Amount (₹ INR) *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">
              ₹
            </span>
            <input
              type="number"
              required
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Description *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Dell Laptop Screen Repair or Shop Electricity"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            >
              {(type === 'income' ? incomeCategories : expenseCategories).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            >
              <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="cash">Cash In Hand</option>
              <option value="card">Debit / Credit Card</option>
              <option value="bank_transfer">NEFT / RTGS / Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Customer / Vendor Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Customer or Vendor (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Patil or CompuMall Lamington"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        {/* Actions */}
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
            Save Transaction
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
