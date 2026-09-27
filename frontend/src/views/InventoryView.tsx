import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR } from '../services/dashboardService';
import { Product, ProductCategory } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Filter, 
  Layers, 
  DollarSign 
} from 'lucide-react';

interface InventoryViewProps {
  onOpenAddProduct: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenAddProduct }) => {
  const { products } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  const categories: string[] = Array.from(new Set(products.map((p: Product) => p.category)));

  const filtered: Product[] = products.filter((p: Product) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && p.stock_quantity <= p.minimum_stock && p.stock_quantity > 0) ||
      (stockFilter === 'out' && p.stock_quantity === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate inventory valuation
  const totalStockValue = products.reduce((sum: number, p: Product) => sum + (p.purchase_price * p.stock_quantity), 0);
  const potentialSalesValue = products.reduce((sum: number, p: Product) => sum + (p.selling_price * p.stock_quantity), 0);
  const totalItemsCount = products.reduce((sum: number, p: Product) => sum + p.stock_quantity, 0);
  const lowStockCount = products.filter((p: Product) => p.stock_quantity <= p.minimum_stock).length;

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Inventory & Spares Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time stock quantities, procurement costs, selling margins and reorder alerts
          </p>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Inventory Valuation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Stock Valuation (Cost)</span>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">{formatINR(totalStockValue)}</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Capital invested in stock</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Potential Sales Value</span>
          <div className="text-xl font-black text-[#087443] mt-1 font-mono">{formatINR(potentialSalesValue)}</div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
            +{formatINR(potentialSalesValue - totalStockValue)} expected gross
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Units in Store</span>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">{totalItemsCount} units</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Across {products.length} SKUs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Critical Reorder Alerts</span>
          <div className="text-xl font-black text-amber-700 mt-1 font-mono">{lowStockCount} items</div>
          <span className="text-[10px] text-amber-600 font-medium mt-0.5 block">Needs replenishment</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search product name, SKU, brand, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="inline-flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1 rounded-md transition-all ${stockFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1 rounded-md transition-all ${stockFilter === 'low' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-slate-500'}`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1 rounded-md transition-all ${stockFilter === 'out' ? 'bg-white text-rose-800 shadow-2xs font-bold' : 'text-slate-500'}`}
            >
              Out of Stock
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#087443]"
          >
            <option value="all">All Categories</option>
            {categories.map((c: string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Product & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Stock Units</th>
                <th className="py-3.5 px-4 text-right">Cost</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-right">Est. Margin</th>
                <th className="py-3.5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p: Product) => {
                const margin = p.selling_price - p.purchase_price;
                const marginPct = p.purchase_price > 0 ? Math.round((margin / p.purchase_price) * 100) : 0;
                const isOutOfStock = p.stock_quantity === 0;
                const isLowStock = p.stock_quantity <= p.minimum_stock;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        SKU: {p.sku} • {p.brand} {p.model}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">{p.stock_quantity}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">min {p.minimum_stock}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                      {formatINR(p.purchase_price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatINR(p.selling_price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                      <span className="font-bold text-[#087443]">+{formatINR(margin)}</span>
                      <span className="text-[10px] text-emerald-700 block font-sans">({marginPct}%)</span>
                    </td>
                    <td className="py-3.5 px-6 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                        isOutOfStock
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isLowStock
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-[#087443] border border-emerald-200'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock')}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="text-sm font-semibold text-slate-600 mb-1">No products found in inventory</div>
                    <div className="text-xs text-slate-400">Click "+ Add Product" to add your first stock item or spare part.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
