import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR } from '../services/dashboardService';
import { Supplier } from '../types';
import { Truck, Search, Phone, Mail, MapPin, Building, AlertCircle } from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers } = useData();
  const [search, setSearch] = useState('');

  const filtered: Supplier[] = suppliers.filter((s: Supplier) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.company.toLowerCase().includes(search.toLowerCase()) ||
    (s.products_supplied && s.products_supplied.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPurchases = suppliers.reduce((sum: number, s: Supplier) => sum + s.total_purchases, 0);
  const totalPayable = suppliers.reduce((sum: number, s: Supplier) => sum + s.pending_payable, 0);

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Suppliers & Vendor Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Component wholesalers in Mumbai, Pune & Bangalore, credit balances and procurement history
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Lifetime Purchases</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{formatINR(totalPurchases)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Supplier Payables</span>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">{formatINR(totalPayable)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Wholesale Channels</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{suppliers.length} Vendors</div>
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s: Supplier) => (
          <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {s.company}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Contact: {s.name}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                  <Truck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{s.phone}</span>
                </div>
                {s.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.email}</span>
                  </div>
                )}
                {s.address && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{s.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                <span className="font-bold text-slate-800 block mb-0.5">Lines Supplied:</span>
                {s.products_supplied}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Total Purchases</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(s.total_purchases)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">Pending Due</span>
                <span className={`font-mono font-bold ${s.pending_payable > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {formatINR(s.pending_payable)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No suppliers registered</h3>
            <p className="text-xs text-slate-400 mt-1">Vendor accounts and component distributors will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
