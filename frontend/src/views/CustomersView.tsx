import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR } from '../services/dashboardService';
import { Customer, Transaction, ServiceJob, PendingPayment } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  Wallet,
  Clock,
  ChevronRight
} from 'lucide-react';

interface CustomersViewProps {
  onOpenAddCustomer: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onOpenAddCustomer }) => {
  const { customers, transactions, serviceJobs, pendingPayments } = useData();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);

  const filtered: Customer[] = customers.filter((c: Customer) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  // Derive history for selected customer
  const customerTx: Transaction[] = selectedCustomer 
    ? transactions.filter((t: Transaction) => t.customer_name === selectedCustomer.name || t.customer_id === selectedCustomer.id)
    : [];

  const customerRepairs: ServiceJob[] = selectedCustomer
    ? serviceJobs.filter((j: ServiceJob) => j.customer_name.toLowerCase().includes(selectedCustomer.name.toLowerCase()))
    : [];

  const customerPending: PendingPayment[] = selectedCustomer
    ? pendingPayments.filter((p: PendingPayment) => p.customer.toLowerCase().includes(selectedCustomer.name.toLowerCase()))
    : [];

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Accounts, service history, lifetime revenue and pending balances
          </p>
        </div>

        <button
          onClick={onOpenAddCustomer}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Main split: Customer List (50%) + Detail Dossier (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Customer List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443] shadow-2xs"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filtered.map((c: Customer) => {
              const isSelected = selectedCustomer?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`p-4 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-emerald-50/60 border-l-4 border-l-[#087443]' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900 font-mono">
                      {formatINR(c.total_spent)}
                    </div>
                    {c.pending_amount > 0 ? (
                      <span className="text-[10px] text-orange-600 font-bold">
                        {formatINR(c.pending_amount)} due
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-medium">
                        All clear
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-slate-400 p-6">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-600 mb-1">No customers registered</div>
                <div className="text-xs text-slate-400">Click "+ Add Customer" to create your first customer profile.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Customer Profile & History */}
        <div className="lg:col-span-6">
          {selectedCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Profile Card */}
              <div className="flex items-start justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#087443] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedCustomer.name}
                    </h2>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className="font-mono">{selectedCustomer.phone}</span>
                      {selectedCustomer.email && <span>• {selectedCustomer.email}</span>}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedCustomer.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Lifetime Purchases</span>
                  <div className="text-lg font-black text-[#087443] font-mono mt-0.5">
                    {formatINR(selectedCustomer.total_spent)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Receivable</span>
                  <div className="text-lg font-black text-orange-600 font-mono mt-0.5">
                    {formatINR(selectedCustomer.pending_amount)}
                  </div>
                </div>
              </div>

              {/* Service & Repair History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Service & Repair History ({customerRepairs.length})
                </h4>
                <div className="space-y-2">
                  {customerRepairs.map((rep: ServiceJob) => (
                    <div key={rep.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{rep.brand} {rep.model} ({rep.device_type})</div>
                        <div className="text-[11px] text-slate-500">{rep.problem_description}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">{formatINR(rep.final_cost || rep.estimated_cost)}</span>
                        <span className="block text-[10px] capitalize text-[#087443] font-semibold">{rep.repair_status.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  ))}
                  {customerRepairs.length === 0 && (
                    <div className="text-xs text-slate-400 py-3 text-center border border-dashed rounded-xl">
                      No repair jobs on record for this customer.
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Ledger Transactions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Recent Sales & Invoices ({customerTx.length})
                </h4>
                <div className="space-y-2">
                  {customerTx.map((t: Transaction) => (
                    <div key={t.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{t.description}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{t.date} • {t.payment_method}</div>
                      </div>
                      <div className="font-mono font-bold text-[#087443]">
                        +{formatINR(t.amount)}
                      </div>
                    </div>
                  ))}
                  {customerTx.length === 0 && (
                    <div className="text-xs text-slate-400 py-3 text-center border border-dashed rounded-xl">
                      No sales records for this customer yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a customer to view their complete dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
