import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR } from '../services/dashboardService';
import { Transaction, PaymentMethod } from '../types';
import { CustomerInvoiceModal } from '../components/modals/CustomerInvoiceModal';
import { Search, Plus, Pencil, Trash2, X, Check, User, Wrench, Printer, Laptop, Disc, Shield, HardDrive, FileText } from 'lucide-react';

interface SalesViewProps {
  onOpenAddSale: () => void;
}

const SALE_CATEGORIES = [
  'Printer Repair',
  'Cartridge & Toner Refill',
  'Laptop & PC Repair',
  'Software & OS Installation',
  'Hardware Sales',
  'CCTV Installation',
  'AMC Service',
  'Service Charges',
  'Other',
];

export const SalesView: React.FC<SalesViewProps> = ({ onOpenAddSale }) => {
  const { transactions, updateTransaction, deleteTransaction, customers } = useData();
  const [search, setSearch] = useState('');

  // Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceCustomer, setSelectedInvoiceCustomer] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPayment, setEditPayment] = useState<PaymentMethod>('cash');
  const [editCustomer, setEditCustomer] = useState('');
  const [editCategory, setEditCategory] = useState('Printer Repair');
  const [editSaving, setEditSaving] = useState(false);

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter sales (income transactions)
  const sales: Transaction[] = transactions.filter((t: Transaction) => t.type === 'income');

  const filtered: Transaction[] = sales.filter((s: Transaction) =>
    s.description.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    (s.customer_name && s.customer_name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSalesRevenue = sales.reduce((sum: number, s: Transaction) => sum + s.amount, 0);

  // Compute top payment method dynamically
  const paymentCounts: Record<string, number> = {};
  sales.forEach(s => {
    const method = s.payment_method?.toUpperCase() || 'OTHER';
    paymentCounts[method] = (paymentCounts[method] || 0) + 1;
  });
  const topPaymentMethod = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const handleOpenInvoiceModal = (customerName: string = '') => {
    setSelectedInvoiceCustomer(customerName);
    setInvoiceModalOpen(true);
  };

  const startEdit = (sale: Transaction) => {
    setEditingId(sale.id);
    setEditDesc(sale.description);
    setEditAmount(String(sale.amount));
    setEditPayment(sale.payment_method);
    setEditCustomer(sale.customer_name || '');
    setEditCategory(sale.category || 'Service Charges');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDesc('');
    setEditAmount('');
    setEditPayment('cash');
    setEditCustomer('');
    setEditCategory('Service Charges');
  };

  const saveEdit = async () => {
    if (!editingId || !editDesc.trim() || !editAmount.trim()) return;
    setEditSaving(true);
    try {
      await updateTransaction(editingId, {
        description: editDesc.trim(),
        amount: Number(editAmount),
        payment_method: editPayment,
        customer_name: editCustomer.trim() || undefined,
        category: editCategory,
      });
      cancelEdit();
    } catch (err) {
      console.error('Edit failed:', err);
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleteLoading(true);
    try {
      await deleteTransaction(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('printer') || cat.includes('toner') || cat.includes('cartridge')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">
          <Printer className="w-3 h-3 stroke-[2.2]" />
          <span>{category}</span>
        </span>
      );
    } else if (cat.includes('laptop') || cat.includes('pc repair') || cat.includes('repair')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
          <Laptop className="w-3 h-3 stroke-[2.2]" />
          <span>{category}</span>
        </span>
      );
    } else if (cat.includes('software') || cat.includes('os')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-semibold">
          <Disc className="w-3 h-3 stroke-[2.2]" />
          <span>{category}</span>
        </span>
      );
    } else if (cat.includes('hardware') || cat.includes('sale')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
          <HardDrive className="w-3 h-3 stroke-[2.2]" />
          <span>{category}</span>
        </span>
      );
    } else if (cat.includes('amc')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold">
          <Shield className="w-3 h-3 stroke-[2.2]" />
          <span>{category}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
        <Wrench className="w-3 h-3 stroke-[2.2]" />
        <span>{category}</span>
      </span>
    );
  };

  const renderCustomerCell = (customerName?: string) => {
    const name = (customerName || '').trim();
    if (!name || name === 'Walk-in Store Customer' || name === 'Walk-in Customer' || name.toLowerCase().includes('walk-in')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11.5px] font-medium border border-slate-200/60">
          Walk-in Customer
        </span>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center flex-shrink-0 border border-blue-200">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-extrabold text-slate-900 text-xs">{name}</div>
          <div className="text-[9.5px] font-bold text-blue-600 uppercase tracking-wide">Regular Customer</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Sales & Service Register
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Over-the-counter billing, printer servicing, toner refills, laptop repairs & customer invoices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenInvoiceModal('Shree Computers')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <FileText className="w-4 h-4 stroke-[2]" />
            <span>📄 Generate Customer Invoice</span>
          </button>

          <button
            onClick={onOpenAddSale}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Record Service / Sale</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Sales Revenue</span>
          <div className="text-2xl font-black text-[#087443] font-mono mt-1">{formatINR(totalSalesRevenue)}</div>
          <span className="text-[10px] text-slate-500">Across {sales.length} customer records</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Average Order Value (AOV)</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(Math.round(totalSalesRevenue / (sales.length || 1)))}
          </div>
          <span className="text-[10px] text-slate-500">Per transaction</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Primary Inflow Channel</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{topPaymentMethod || 'UPI / Cash / Card'}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Real-time payment tracking</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search service, customer name, printer, toner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
          />
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Service / Type</th>
                <th className="py-3.5 px-4">Work Done / Item Details</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-6 text-right">Price (INR)</th>
                <th className="py-3.5 px-4 text-center w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s: Transaction) => (
                <tr key={s.id} className={`hover:bg-slate-50/70 transition-colors ${editingId === s.id ? 'bg-emerald-50/40' : ''}`}>
                  {editingId === s.id ? (
                    /* ---- EDIT MODE ROW ---- */
                    <>
                      <td className="py-3 px-6 font-medium text-slate-500 whitespace-nowrap">{s.date}</td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          list="edit-customer-list"
                          value={editCustomer}
                          onChange={e => setEditCustomer(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#087443]/30 focus:border-[#087443]"
                          placeholder="Customer name..."
                        />
                        <datalist id="edit-customer-list">
                          <option value="Walk-in Store Customer" />
                          <option value="Shree Computers" />
                          {customers.map(c => (
                            <option key={c.id} value={c.name} />
                          ))}
                        </datalist>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087443]/30 focus:border-[#087443]"
                        >
                          {SALE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editDesc}
                          onChange={e => setEditDesc(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#087443]/30 focus:border-[#087443]"
                          placeholder="Service description / work done..."
                          autoFocus
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={editPayment}
                          onChange={e => setEditPayment(e.target.value as PaymentMethod)}
                          className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#087443]/30 focus:border-[#087443]"
                        >
                          <option value="cash">CASH</option>
                          <option value="UPI">UPI</option>
                          <option value="card">CARD</option>
                          <option value="bank_transfer">BANK TRANSFER</option>
                          <option value="other">OTHER</option>
                        </select>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[#087443] font-bold text-xs">₹</span>
                          <input
                            type="number"
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                            className="w-20 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-right font-mono font-bold text-[#087443] focus:outline-none focus:ring-2 focus:ring-[#087443]/30 focus:border-[#087443]"
                            min="0"
                            step="1"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={saveEdit}
                            disabled={editSaving}
                            className="p-1.5 rounded-lg bg-[#087443] text-white hover:bg-[#065F37] transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    /* ---- DISPLAY MODE ROW ---- */
                    <>
                      <td className="py-3.5 px-6 font-medium text-slate-500 whitespace-nowrap">{s.date}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {renderCustomerCell(s.customer_name)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getCategoryBadge(s.category)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.description}</td>
                      <td className="py-3.5 px-4 uppercase font-mono text-[11px] text-slate-600">{s.payment_method}</td>
                      <td className="py-3.5 px-6 text-right font-black font-mono text-[#087443] text-[13px]">
                        +{formatINR(s.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenInvoiceModal(s.customer_name || 'Walk-in')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                            title="Generate Customer Statement / Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                          <button
                            onClick={() => startEdit(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#087443] hover:bg-emerald-50 transition-all"
                            title="Edit record"
                          >
                            <Pencil className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="text-sm font-semibold text-slate-600 mb-1">No sales or service records found</div>
                    <div className="text-xs text-slate-400">Click "+ Record Service / Sale" to add a new record.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Invoice Generator Modal */}
      <CustomerInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        initialCustomerName={selectedInvoiceCustomer}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete this record?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone. The record will be permanently removed.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-100">
              {(() => {
                const sale = sales.find(s => s.id === deleteConfirmId);
                return sale ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{sale.description}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sale.customer_name || 'Walk-in'} · {sale.date} · {sale.payment_method?.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-sm font-black font-mono text-[#087443]">+{formatINR(sale.amount)}</div>
                  </div>
                ) : null;
              })()}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleteLoading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
