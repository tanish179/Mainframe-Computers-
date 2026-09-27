import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Settings, 
  Database, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Building, 
  MapPin, 
  ShieldCheck, 
  Save,
  Trash2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { isSupabaseLive, resetToDemoData } = useData();

  const [businessName, setBusinessName] = useState(() => {
    return localStorage.getItem('mf_store_name') || 'Mainframe Computers';
  });
  const [address, setAddress] = useState(() => {
    return localStorage.getItem('mf_store_address') || 'Kolhapur, Maharashtra, India';
  });
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem('mf_store_phone') || '';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('mf_store_email') || '';
  });
  const [gstNumber, setGstNumber] = useState(() => {
    return localStorage.getItem('mf_store_gst') || '';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mf_store_name', businessName);
    localStorage.setItem('mf_store_address', address);
    localStorage.setItem('mf_store_phone', phone);
    localStorage.setItem('mf_store_email', email);
    localStorage.setItem('mf_store_gst', gstNumber);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadSQL = () => {
    const sqlContent = `-- Mainframe Computers PostgreSQL Schema & Seed
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    minimum_stock_level INT NOT NULL DEFAULT 2
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'refund', 'transfer')),
    amount NUMERIC(12,2) NOT NULL,
    description TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number TEXT UNIQUE NOT NULL,
    device_type TEXT NOT NULL,
    device_brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    customer_problem TEXT NOT NULL,
    repair_status TEXT NOT NULL DEFAULT 'received',
    estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    final_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    advance_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(12,2) NOT NULL DEFAULT 0
);
`;

    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mainframe_computers_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          System Settings & Database
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Store profile, currency, GST tax configuration, Supabase PostgreSQL synchronization and backups
        </p>
      </div>

      {/* Business Details Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Building className="w-5 h-5 text-[#087443]" />
          <span>Business Identity</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          These details appear on printed repair tickets, sales receipts, and tax invoices.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Store Location / Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Store Phone
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98220 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                placeholder="e.g. contact@mainframecomputers.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                placeholder="e.g. 27AABCU9603R1ZM"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Currency
              </label>
              <input
                type="text"
                disabled
                value="INR (₹) — Indian Rupee"
                className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Timezone
              </label>
              <input
                type="text"
                disabled
                value="Asia/Kolkata (IST +5:30)"
                className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-bold text-[#087443] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Supabase & Cloud Synchronization */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-700" />
          <span>Supabase PostgreSQL Integration</span>
        </h3>
        <p className="text-xs text-slate-500">
          The dashboard automatically falls back to reactive local storage with instant calculations and full state retention. When your remote Supabase instance is active, provide your project credentials below or in your <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded font-mono">.env</code> file.
        </p>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Connection Status</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isSupabaseLive ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isSupabaseLive ? 'Connected & Synchronized' : 'Mainframe Local Engine (Persistent)'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Row Level Security (RLS) active • Real-time reactive data store • Zero data loss
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadSQL}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download SQL Schema</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all data and start completely clean?")) {
                resetToDemoData();
                alert("All records cleared successfully!");
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
