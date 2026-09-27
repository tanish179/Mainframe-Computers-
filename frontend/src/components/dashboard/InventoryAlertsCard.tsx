import React from 'react';
import { useData } from '../../context/DataContext';
import { Package, AlertTriangle, ArrowRight, PlusCircle } from 'lucide-react';
import { NavTab } from '../../types';

interface InventoryAlertsCardProps {
  onNavigateToTab: (tab: NavTab) => void;
  onAddProductClick: () => void;
}

export const InventoryAlertsCard: React.FC<InventoryAlertsCardProps> = ({
  onNavigateToTab,
  onAddProductClick
}) => {
  const { products } = useData();

  // Show items with Low Stock or Out of Stock first, then others
  const sorted = [...products].sort((a, b) => {
    if (a.stock_quantity === 0) return -1;
    if (b.stock_quantity === 0) return 1;
    if (a.stock_quantity <= a.minimum_stock) return -1;
    if (b.stock_quantity <= b.minimum_stock) return 1;
    return a.stock_quantity - b.stock_quantity;
  }).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Inventory Alerts
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Stock levels, fast-moving spares & reorder thresholds
            </p>
          </div>
          <button
            onClick={onAddProductClick}
            className="text-xs font-bold text-[#087443] hover:text-[#065F37] flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-2">Product</th>
                <th className="pb-2 text-center">Current</th>
                <th className="pb-2 text-center">Min</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((p) => {
                const isOutOfStock = p.stock_quantity === 0;
                const isLowStock = p.stock_quantity <= p.minimum_stock;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {p.sku}
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-mono font-bold text-slate-800">
                      {p.stock_quantity}
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-400">
                      {p.minimum_stock}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOutOfStock
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          : isLowStock
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            : 'bg-emerald-50 text-[#087443] border border-emerald-200/60'
                      }`}>
                        {isOutOfStock ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock')}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                    No items in inventory. Click "Add Item" to add stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => onNavigateToTab('inventory')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <span>Manage Full Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] text-slate-400">
          Total items: {products.length}
        </span>
      </div>
    </div>
  );
};
