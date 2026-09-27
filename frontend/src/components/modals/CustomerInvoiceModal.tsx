import React, { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { useData } from '../../context/DataContext';
import { formatINR } from '../../services/dashboardService';
import { Transaction } from '../../types';
import { Printer, Download, Search, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';

interface CustomerInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerName?: string;
}

export const CustomerInvoiceModal: React.FC<CustomerInvoiceModalProps> = ({
  isOpen,
  onClose,
  initialCustomerName = '',
}) => {
  const { transactions, customers } = useData();

  const [selectedCustomer, setSelectedCustomer] = useState(initialCustomerName);
  const [periodFilter, setPeriodFilter] = useState<'all' | 'this_month' | 'last_month'>('this_month');
  const [showPrintView, setShowPrintView] = useState(false);

  // Sync initialCustomerName when modal opens
  React.useEffect(() => {
    if (initialCustomerName) {
      setSelectedCustomer(initialCustomerName);
    }
  }, [initialCustomerName]);

  // Filter income transactions for the selected customer
  const allCustomerSales = transactions.filter((t: Transaction) => {
    if (t.type !== 'income') return false;
    if (!selectedCustomer) return false;

    const targetName = selectedCustomer.trim().toLowerCase();
    const custName = (t.customer_name || '').trim().toLowerCase();
    const desc = (t.description || '').toLowerCase();

    return custName.includes(targetName) || desc.includes(targetName);
  });

  // Apply month filter
  const filteredSales = allCustomerSales.filter((t: Transaction) => {
    if (periodFilter === 'all') return true;

    const txDate = new Date(t.date || t.created_at);
    const now = new Date();

    if (periodFilter === 'this_month') {
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    } else if (periodFilter === 'last_month') {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        txDate.getMonth() === lastMonthDate.getMonth() &&
        txDate.getFullYear() === lastMonthDate.getFullYear()
      );
    }
    return true;
  });

  const totalBilled = filteredSales.reduce((sum, s) => sum + s.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Monthly Invoice & Statement Generator"
      subtitle="Generate, review, and print itemized monthly bills & transaction history"
    >
      <div className="space-y-4">
        {/* Print Stylesheet */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-invoice-area, #printable-invoice-area * {
              visibility: visible;
            }
            #printable-invoice-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              background: white;
              color: black;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Customer Search & Filter Bar */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3 no-print">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select or Search Customer
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  list="invoice-customer-list"
                  placeholder="e.g. Shree Computers / Rajesh Kumar..."
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/30 focus:border-[#087443]"
                />
                <datalist id="invoice-customer-list">
                  <option value="Shree Computers" />
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Billing Period
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087443]/30 focus:border-[#087443]"
              >
                <option value="this_month">Current Month (Sept 2026)</option>
                <option value="last_month">Previous Month (Aug 2026)</option>
                <option value="all">All-Time Statement</option>
              </select>
            </div>
          </div>

          {/* Quick select chips for customer search */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-semibold">Suggested Customers:</span>
            <button
              type="button"
              onClick={() => setSelectedCustomer('Shree Computers')}
              className="text-[10.5px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium hover:bg-emerald-200 transition-colors"
            >
              🏢 Shree Computers
            </button>
            {customers.slice(0, 4).map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setSelectedCustomer(c.name)}
                className="text-[10.5px] px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded font-medium hover:border-[#087443] hover:text-[#087443] transition-colors"
              >
                👤 {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between no-print bg-white p-3 rounded-xl border border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-900">
              {selectedCustomer ? `Statement for "${selectedCustomer}"` : 'Please select a customer'}
            </div>
            <div className="text-[11px] text-slate-500">
              Found {filteredSales.length} billing items totaling <strong className="text-[#087443] font-mono">{formatINR(totalBilled)}</strong>
            </div>
          </div>

          {selectedCustomer && filteredSales.length > 0 && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Printer className="w-4 h-4 stroke-[2.2]" />
              <span>Print / Save PDF</span>
            </button>
          )}
        </div>

        {/* PRINTABLE INVOICE / STATEMENT AREA */}
        <div id="printable-invoice-area" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {/* Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#087443] text-white flex items-center justify-center font-black text-sm">
                  MF
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">MAINFRAME COMPUTERS</h2>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    Hardware Sales · Printer Servicing · Laptop Repair · IT Solutions
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded-md uppercase tracking-wider">
                MONTHLY STATEMENT / INVOICE
              </span>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Statement Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Customer & Period Meta Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider mb-0.5">Billed To</span>
              <div className="text-sm font-black text-slate-900">{selectedCustomer || 'N/A'}</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Regular Client Account</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider mb-0.5">Billing Summary</span>
              <div className="text-sm font-black font-mono text-[#087443]">{formatINR(totalBilled)}</div>
              <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                {filteredSales.length} Total Services / Sales Recorded
              </div>
            </div>
          </div>

          {/* Itemized Services & Sales Table */}
          <table className="w-full text-left text-xs mb-6">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-200 text-slate-700 font-bold uppercase text-[10.5px]">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Service / Item Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSales.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-600 whitespace-nowrap">{s.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{s.description}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[10.5px] font-medium border border-slate-200">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 uppercase font-mono text-[10.5px] text-slate-600">{s.payment_method}</td>
                  <td className="py-2.5 px-3 text-right font-black font-mono text-[#087443] text-xs">
                    {formatINR(s.amount)}
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions found for {selectedCustomer || 'selected customer'}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Invoice Totals Calculation Box */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({filteredSales.length} items):</span>
                <span className="font-mono font-bold">{formatINR(totalBilled)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Tax / GST:</span>
                <span className="font-mono font-medium">₹0.00</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-sm font-black text-slate-900">
                <span>Total Amount Due:</span>
                <span className="font-mono text-[#087443]">{formatINR(totalBilled)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature & Terms */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[10.5px] text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Mainframe Computers - Service & Billing Department</p>
              <p>Thank you for your business!</p>
            </div>
            <div className="text-right">
              <div className="h-8 mb-1 border-b border-dashed border-slate-300 w-36 ml-auto" />
              <p className="font-bold text-slate-700">Authorized Stamp & Signature</p>
            </div>
          </div>
        </div>

        {/* Modal Close Footer */}
        <div className="pt-2 flex items-center justify-end gap-2 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};
