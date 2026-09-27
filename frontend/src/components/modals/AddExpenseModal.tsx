import React, { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { useData } from '../../context/DataContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, suppliers } = useData();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  const categories = [
    'Inventory Purchase', 'Supplier Payment', 'Rent', 'Electricity',
    'Internet', 'Transport', 'Salary', 'Marketing', 'Software',
    'Maintenance', 'Tools', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addExpense({
      description,
      category,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      vendor,
      notes
    });

    onClose();
    setDescription('');
    setAmount('');
    setVendor('');
    setNotes('');
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Record Business Expense"
      subtitle="Track operating overheads, utilities, inventory purchases and rent"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Expense Amount (₹) *
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
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-800"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Description / Item *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Shop monthly rent or Fiber internet Airtel"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-800"
          />
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-800"
            >
              {categories.map((c) => (
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
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-800"
            >
              <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="cash">Cash In Hand</option>
              <option value="bank_transfer">Bank Transfer / Cheque</option>
              <option value="card">Company Debit/Credit Card</option>
            </select>
          </div>
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Vendor / Payee
          </label>
          <input
            type="text"
            placeholder="e.g. MSEDCL, Airtel, Landlord, CompuMall"
            list="supplier-suggestions"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-800"
          />
          <datalist id="supplier-suggestions">
            {suppliers.map(s => (
              <option key={s.id} value={s.company || s.name} />
            ))}
          </datalist>
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
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            Record Expense
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
