import React, { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { useData } from '../../context/DataContext';

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSaleModal: React.FC<AddSaleModalProps> = ({ isOpen, onClose }) => {
  const { addSale, customers, products } = useData();

  const [customerName, setCustomerName] = useState('');
  const [itemsDescription, setItemsDescription] = useState('');
  const [category, setCategory] = useState('Laptop Sale');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount) return;

    addSale({
      customer_name: customerName,
      items_description: itemsDescription || 'Computer Hardware & Peripherals',
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      category
    });

    onClose();
    setCustomerName('');
    setItemsDescription('');
    setAmount('');
  };

  const handleSelectProduct = (prodName: string, price: number, cat: string) => {
    setItemsDescription(prodName);
    setAmount(price.toString());
    setCategory(cat.includes('Laptop') ? 'Laptop Sale' : cat.includes('Cartridge') ? 'Cartridge Refill' : 'Accessories');
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer Sale"
      subtitle="POS entry for computers, accessories, peripherals & consumables"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            required
            list="customer-suggestions"
            placeholder="Type or select customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
          <datalist id="customer-suggestions">
            {customers.map(c => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        {/* Quick select from in-stock catalog */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Quick Fill from Popular Inventory
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200/60">
            {products.slice(0, 6).map(p => (
              <button
                type="button"
                key={p.id}
                onClick={() => handleSelectProduct(p.name, p.selling_price, p.category)}
                className="text-[10.5px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 hover:border-[#087443] hover:text-[#087443] transition-colors"
              >
                + {p.name.split(' ')[0]} {p.model || ''} (₹{p.selling_price})
              </button>
            ))}
          </div>
        </div>

        {/* Items Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Item / Service Description *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Dell Latitude 7490 + Logitech Wireless Combo"
            value={itemsDescription}
            onChange={(e) => setItemsDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        {/* Amount & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Total Sale Amount (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            >
              <option value="Laptop Sale">Laptop Sale (New/Refurb)</option>
              <option value="Desktop Sale">Desktop Sale</option>
              <option value="PC Build">Custom PC Build</option>
              <option value="Accessories">Accessories & Peripherals</option>
              <option value="Cartridge Refill">Cartridge & Toner Refill</option>
              <option value="CCTV Installation">CCTV Installation & Kit</option>
            </select>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          >
            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
            <option value="cash">Cash Received</option>
            <option value="card">Card Swipe (POS)</option>
            <option value="bank_transfer">Direct Bank Transfer (NEFT/IMPS)</option>
          </select>
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
            Confirm Sale & Record Payment
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
