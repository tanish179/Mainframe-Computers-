import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatINR } from '../services/dashboardService';
import { Transaction, ServiceJob, Product, PendingPayment, Supplier } from '../types';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  FileSpreadsheet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Printer,
  ShieldAlert,
  Wallet
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, serviceJobs, products, pendingPayments, suppliers, stats } = useData();
  const [reportType, setReportType] = useState<
    'revenue' | 'expenses' | 'profit' | 'sales' | 'repairs' | 'inventory' | 'pending' | 'suppliers'
  >('revenue');
  const [timeframe, setTimeframe] = useState<'This Month' | 'Last Month' | 'This Year' | 'All Time'>('This Month');

  const exportCurrentReportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    const dateStamp = new Date().toISOString().split('T')[0];

    if (reportType === 'revenue' || reportType === 'sales') {
      headers = ['Date', 'Description', 'Category', 'Payment Method', 'Amount'];
      rows = transactions
        .filter((t: Transaction) => t.type === 'income')
        .map((t: Transaction) => [t.date, `"${t.description.replace(/"/g, '""')}"`, t.category, t.payment_method, t.amount]);
    } else if (reportType === 'expenses') {
      headers = ['Date', 'Description', 'Category', 'Payment Method', 'Amount'];
      rows = transactions
        .filter((t: Transaction) => t.type === 'expense')
        .map((t: Transaction) => [t.date, `"${t.description.replace(/"/g, '""')}"`, t.category, t.payment_method, t.amount]);
    } else if (reportType === 'repairs') {
      headers = ['Job ID', 'Customer', 'Device', 'Brand/Model', 'Status', 'Estimated', 'Final Cost'];
      rows = serviceJobs.map((j: ServiceJob) => [
        j.job_number,
        `"${j.customer_name}"`,
        j.device_type,
        `"${j.brand} ${j.model}"`,
        j.repair_status,
        j.estimated_cost,
        j.final_cost
      ]);
    } else if (reportType === 'inventory') {
      headers = ['Product', 'SKU', 'Category', 'Stock Qty', 'Min Stock', 'Purchase Price', 'Selling Price'];
      rows = products.map((p: Product) => [
        `"${p.name}"`,
        p.sku,
        p.category,
        p.stock_quantity,
        p.minimum_stock,
        p.purchase_price,
        p.selling_price
      ]);
    } else if (reportType === 'pending') {
      headers = ['Customer', 'Invoice', 'Amount Due', 'Due Date', 'Status'];
      rows = pendingPayments.map((p: PendingPayment) => [
        `"${p.customer}"`,
        p.invoice,
        p.amount,
        p.due_date,
        p.status
      ]);
    } else if (reportType === 'suppliers') {
      headers = ['Supplier', 'Company', 'Phone', 'Products', 'Total Purchases', 'Pending Payable'];
      rows = suppliers.map((s: Supplier) => [
        `"${s.name}"`,
        `"${s.company}"`,
        s.phone,
        `"${s.products_supplied || ''}"`,
        s.total_purchases,
        s.pending_payable
      ]);
    } else {
      headers = ['Metric', 'Value'];
      rows = [
        ['Total Income', stats.total_income],
        ['Total Expenses', stats.total_expenses],
        ['Net Operating Profit', stats.net_profit],
        ['Pending Receivables', stats.pending_payments_total]
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mainframe_${reportType}_report_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Financial & Operational Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Comprehensive audit reports, tax summaries, P&L statements and export tools
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#087443]"
          >
            <option value="This Month">This Month (Sep 2026)</option>
            <option value="Last Month">Last Month (Aug 2026)</option>
            <option value="This Year">Financial Year 2026-27</option>
            <option value="All Time">All Historical Data</option>
          </select>

          <button
            onClick={exportCurrentReportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'revenue', label: 'Revenue Report' },
          { id: 'expenses', label: 'Expense Report' },
          { id: 'profit', label: 'Profit & Loss (P&L)' },
          { id: 'sales', label: 'Sales Report' },
          { id: 'repairs', label: 'Repair Revenue' },
          { id: 'inventory', label: 'Inventory Valuation' },
          { id: 'pending', label: 'Pending Receivables' },
          { id: 'suppliers', label: 'Supplier Payables' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === tab.id
                ? 'bg-[#087443] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content Surface */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 capitalize">
              {reportType.replace(/_/g, ' ')} Statement
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered for Mainframe Computers — {timeframe}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Audit Ready
          </span>
        </div>

        {/* Dynamic Display depending on Report Type */}
        {reportType === 'profit' ? (
          <div className="space-y-4 max-w-xl">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-700">Gross Operating Income</span>
              <span className="font-mono font-bold text-[#087443] text-sm">+{formatINR(stats.total_income)}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-700">Total Operating Expenses</span>
              <span className="font-mono font-bold text-slate-800 text-sm">-{formatINR(stats.total_expenses)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-emerald-50/70 p-4 rounded-xl text-sm border border-emerald-200">
              <span className="font-extrabold text-[#087443]">Net Profit Before Taxes</span>
              <span className="font-mono font-black text-[#087443] text-lg">+{formatINR(stats.net_profit)}</span>
            </div>
          </div>
        ) : reportType === 'repairs' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10.5px]">
                  <th className="py-2.5 px-4">Ticket</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Hardware</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {serviceJobs.map((j: ServiceJob) => (
                  <tr key={j.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-mono font-bold">{j.job_number}</td>
                    <td className="py-2.5 px-4 font-semibold">{j.customer_name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{j.brand} {j.model}</td>
                    <td className="py-2.5 px-4 capitalize font-medium text-emerald-700">{j.repair_status.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatINR(j.final_cost || j.estimated_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'pending' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10.5px]">
                  <th className="py-2.5 px-4">Invoice</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingPayments.map((p: PendingPayment) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-mono font-bold">{p.invoice}</td>
                    <td className="py-2.5 px-4 font-semibold">{p.customer}</td>
                    <td className="py-2.5 px-4 text-slate-500">{p.due_date}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-orange-600">{formatINR(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'suppliers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10.5px]">
                  <th className="py-2.5 px-4">Supplier Company</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">Products Supplied</th>
                  <th className="py-2.5 px-4 text-right">Lifetime Purchases</th>
                  <th className="py-2.5 px-4 text-right">Payable Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s: Supplier) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{s.company} ({s.name})</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{s.phone}</td>
                    <td className="py-2.5 px-4 text-slate-600">{s.products_supplied}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold">{formatINR(s.total_purchases)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-700">{formatINR(s.pending_payable)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Default Ledger / Transactions Preview */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10.5px]">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 15).map((t: Transaction) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-medium text-slate-500">{t.date}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{t.description}</td>
                    <td className="py-2.5 px-4 text-slate-600">{t.category}</td>
                    <td className="py-2.5 px-4 capitalize font-semibold">{t.type}</td>
                    <td className={`py-2.5 px-4 text-right font-mono font-bold ${t.type === 'income' ? 'text-[#087443]' : 'text-slate-900'}`}>
                      {t.type === 'income' ? `+${formatINR(t.amount)}` : `-${formatINR(t.amount)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
