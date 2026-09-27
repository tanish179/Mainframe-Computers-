import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  MessageSquare, 
  Menu, 
  CheckCircle2, 
  Database, 
  Sparkles,
  Command
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenQuickActions: () => void;
  onSearchFocus?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenMobileMenu, 
  onOpenQuickActions,
  onSearchFocus
}) => {
  const { isSupabaseLive, activeRepairs, lowStockItems } = useData();
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationCount = (lowStockItems.length > 0 ? 1 : 0) + (activeRepairs.length > 0 ? 1 : 0);

  return (
    <header className="sticky top-0 z-30 h-18 bg-white border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar with keyboard shortcut */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search transactions, inventory, sales..."
            onClick={onSearchFocus}
            className="w-full pl-10 pr-14 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087443]/20 focus:border-[#087443] transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions, Database State, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4 ml-4">
        {/* Supabase Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-emerald-50 text-emerald-800 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{isSupabaseLive ? 'Supabase Live' : 'Mainframe OS Active'}</span>
        </div>

        {/* Notifications Icon with dropdown preview */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[11px] text-emerald-700 font-medium">All caught up</span>
              </div>
              <div className="py-2 px-3 space-y-2 text-xs">
                {lowStockItems.length > 0 && (
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60">
                    <span className="font-semibold block">⚠️ Inventory Warning</span>
                    {lowStockItems.length} products have reached minimum reorder levels.
                  </div>
                )}
                {activeRepairs.length > 0 ? (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/60">
                    <span className="font-semibold block">🛠️ Repair Jobs</span>
                    {activeRepairs.length} repair jobs currently in progress.
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60">
                    <span className="font-semibold block">🛠️ Repair Queue Clear</span>
                    No active hardware repair jobs.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages / Activity icon */}
        <button
          onClick={onOpenQuickActions}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden sm:flex items-center justify-center"
          title="Quick Actions"
        >
          <Sparkles className="w-5 h-5 text-emerald-700 stroke-[1.8]" />
        </button>

        {/* Divider */}
        <div className="h-7 w-[1px] bg-slate-200" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#087443] to-emerald-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs">
            MA
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[13px] font-semibold text-slate-900 leading-tight">
              Mainframe Admin
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Administrator
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
