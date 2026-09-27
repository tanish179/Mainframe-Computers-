import React, { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { useData } from '../../context/DataContext';

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_PRESETS = [
  { label: '🖨️ Printer Repair', desc: 'Printer Repair & Servicing', price: 450, category: 'Printer Repair' },
  { label: '🧴 Toner Refill', desc: 'Toner & Cartridge Refill', price: 350, category: 'Cartridge & Toner Refill' },
  { label: '💻 Laptop Service', desc: 'Laptop Repair & General Servicing', price: 800, category: 'Laptop & PC Repair' },
  { label: '💿 Windows / OS', desc: 'Windows OS & Software Installation', price: 500, category: 'Software & OS Installation' },
  { label: '🔌 RAM / SSD Upgrade', desc: 'Hardware Upgrade (RAM/SSD)', price: 1500, category: 'Hardware Sales' },
  { label: '📷 CCTV Service', desc: 'CCTV Installation & Maintenance', price: 1200, category: 'CCTV Installation' },
];

export const AddSaleModal: React.FC<AddSaleModalProps> = ({ isOpen, onClose }) => {
  const { addSale, customers, products } = useData();

  const [customerName, setCustomerName] = useState('');
  const [itemsDescription, setItemsDescription] = useState('');
  const [category, setCategory] = useState('Service Charges');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    try {
      const items = selectedProductId
        ? [{ product_id: selectedProductId, name: itemsDescription, quantity: 1, unit_price: parseFloat(amount) }]
        : [];

      await addSale({
        customer_name: customerName.trim() || 'Walk-in Store Customer',
        items_description: itemsDescription || 'Service / Sale',
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        category,
        items
      });

      onClose();
      setCustomerName('');
      setItemsDescription('');
      setAmount('');
      setSelectedProductId(null);
    } catch (err: any) {
      alert(`Sale recording error: ${err.message || err}`);
    }
  };

  const handleApplyPreset = (preset: typeof SERVICE_PRESETS[0]) => {
    setSelectedProductId(null);
    setCategory(preset.category);
    setItemsDescription(preset.desc);
    setAmount(preset.price.toString());
  };

  const handleSelectProduct = (prodId: string, prodName: string, price: number, cat: string) => {
    setSelectedProductId(prodId);
    setItemsDescription(prodName);
    setAmount(price.toString());
    setCategory(cat.includes('Laptop') ? 'Hardware Sales' : cat.includes('Cartridge') ? 'Cartridge & Toner Refill' : 'Hardware Sales');
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Sale / Service"
      subtitle="POS entry for services (printer, toner, laptop repair, OS install) & product sales"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Service Presets */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Quick Service Templates
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SERVICE_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.label}
                onClick={() => handleApplyPreset(preset)}
                className="text-[11px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg font-medium transition-all"
              >
                {preset.label} (₹{preset.price})
              </button>
            ))}
          </div>
        </div>

        {/* Quick select from in-stock inventory */}
        {products.length > 0 && (
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              In-Stock Product Catalog
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200/60">
              {products.slice(0, 6).map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectProduct(p.id, p.name, p.selling_price, p.category)}
                  className={`text-[10.5px] px-2 py-0.5 border rounded transition-colors ${
                    selectedProductId === p.id 
                      ? 'bg-[#087443] text-white border-[#087443]' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#087443] hover:text-[#087443]'
                  }`}
                >
                  + {p.name.split(' ')[0]} {p.model || ''} (₹{p.selling_price})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Customer Selection / Regular Customer */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">
              Customer Name / Regular Customer *
            </label>
            <span className="text-[10px] text-slate-400">Select regular customer or enter new name</span>
          </div>

          <input
            type="text"
            list="regular-customer-list"
            placeholder="Type customer name (e.g. Rajesh Kumar / Walk-in Store Customer)..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
          <datalist id="regular-customer-list">
            <option value="Walk-in Store Customer" />
            <option value="Regular Service Customer" />
            {customers.map(c => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>

          {/* Quick customer selector chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] text-slate-400 font-semibold">Quick Select:</span>
            <button
              type="button"
              onClick={() => setCustomerName('Walk-in Store Customer')}
              className="text-[10.5px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              Walk-in Customer
            </button>
            {customers.slice(0, 4).map(c => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCustomerName(c.name)}
                className="text-[10.5px] px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors border border-blue-100"
              >
                👤 {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Service / Item Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Service Work / Item Description *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. HP Printer Roller Replacement & Toner Refill / Windows 11 Pro Install"
            value={itemsDescription}
            onChange={(e) => setItemsDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        {/* Amount & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Service Price / Amount (₹) *
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
              Service / Sale Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            >
              <option value="Printer Repair">Printer Repair & Servicing</option>
              <option value="Cartridge & Toner Refill">Toner & Cartridge Refill</option>
              <option value="Laptop & PC Repair">Laptop / Computer Repair</option>
              <option value="Software & OS Installation">Software & OS Installation</option>
              <option value="Hardware Sales">Hardware & Laptop Sales</option>
              <option value="CCTV Installation">CCTV Installation & Repair</option>
              <option value="AMC Service">AMC Service Contract</option>
              <option value="Service Charges">General Service Charges</option>
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
            Confirm & Save Record
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
