import React, { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { useData } from '../../context/DataContext';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer } = useData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addCustomer({
      name,
      phone,
      email: email || undefined,
      address: address || 'Kolhapur, Maharashtra',
      status: 'active',
      notes: notes || undefined
    });

    onClose();
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer Profile"
      subtitle="Register client for warranty, billing and service history"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Vikram Shinde"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Phone *
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98220 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="client@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Address / Area
          </label>
          <input
            type="text"
            placeholder="e.g. Rajarampuri 5th lane, Kolhapur"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Notes / Special Instructions
          </label>
          <textarea
            rows={2}
            placeholder="Any customer preferences or enterprise GST details"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
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
            Save Customer
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
