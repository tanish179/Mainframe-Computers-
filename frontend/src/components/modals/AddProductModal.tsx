import React, { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { useData } from '../../context/DataContext';
import { ProductCategory } from '../../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, suppliers } = useData();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Laptop');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('5');
  const [minimumStock, setMinimumStock] = useState('2');
  const [supplierId, setSupplierId] = useState('');

  const categories: ProductCategory[] = [
    'Laptop', 'Desktop', 'CPU', 'GPU', 'RAM', 'SSD', 'HDD',
    'Motherboard', 'Power Supply', 'Monitor', 'Keyboard', 'Mouse',
    'Printer', 'Cartridge', 'Cable', 'CCTV', 'Accessory', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sellingPrice) return;

    const generatedSku = sku || `${brand.slice(0, 3).toUpperCase()}-${category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    addProduct({
      name,
      category,
      sku: generatedSku,
      brand,
      model: model || 'Standard',
      purchase_price: parseFloat(purchasePrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      stock_quantity: parseInt(stockQuantity, 10) || 0,
      minimum_stock: parseInt(minimumStock, 10) || 2,
      supplier_id: supplierId || undefined
    });

    onClose();
    setName('');
    setModel('');
    setPurchasePrice('');
    setSellingPrice('');
    setStockQuantity('5');
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Add Product to Inventory"
      subtitle="Stock tracking, reorder alert threshold and margin setup"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Product Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Kingston NV2 500GB M.2 NVMe SSD"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              placeholder="e.g. Kingston, HP"
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
              placeholder="e.g. SNV2S/500G"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Purchase Cost (₹)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Selling Price (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="0.00"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Initial Stock Units
            </label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Min Stock Warning
            </label>
            <input
              type="number"
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supplier (Optional)
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.company})</option>
              ))}
            </select>
          </div>
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
            Add to Inventory
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
