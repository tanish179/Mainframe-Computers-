import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  ShoppingCart, 
  Receipt, 
  Wrench, 
  Users, 
  Package, 
  BarChart3, 
  CalendarDays, 
  Truck, 
  UserCog, 
  Settings, 
  HelpCircle, 
  LogOut,
  Sparkles,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { NavTab } from '../../types';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { activeRepairs, lowStockItems, pendingPayments } = useData();

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="h-18 px-6 flex items-center gap-3 border-b border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-[#087443] flex items-center justify-center shadow-xs text-white">
              <Monitor className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-[13px] font-bold tracking-wider text-[#0F172A] uppercase leading-tight">
                MAINFRAME
              </div>
              <div className="text-[11px] font-semibold tracking-widest text-[#087443] uppercase">
                COMPUTERS
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-250px)]">
            {/* MAIN GROUP */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                MAIN
              </div>
              <nav className="space-y-1">
                <NavItem 
                  label="Dashboard" 
                  icon={<LayoutDashboard className="w-4 h-4" />} 
                  active={currentTab === 'dashboard'} 
                  onClick={() => handleNavClick('dashboard')} 
                />
                <NavItem 
                  label="Transactions" 
                  icon={<ArrowLeftRight className="w-4 h-4" />} 
                  active={currentTab === 'transactions'} 
                  onClick={() => handleNavClick('transactions')} 
                />
                <NavItem 
                  label="Sales" 
                  icon={<ShoppingCart className="w-4 h-4" />} 
                  active={currentTab === 'sales'} 
                  onClick={() => handleNavClick('sales')} 
                />
                <NavItem 
                  label="Expenses" 
                  icon={<Receipt className="w-4 h-4" />} 
                  active={currentTab === 'expenses'} 
                  onClick={() => handleNavClick('expenses')} 
                />
                <NavItem 
                  label="Inventory" 
                  icon={<Package className="w-4 h-4" />} 
                  active={currentTab === 'inventory'} 
                  badge={lowStockItems.length > 0 ? String(lowStockItems.length) : undefined}
                  badgeVariant="amber"
                  onClick={() => handleNavClick('inventory')} 
                />
              </nav>
            </div>

            {/* BUSINESS GROUP */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                BUSINESS
              </div>
              <nav className="space-y-1">
                <NavItem 
                  label="Reports" 
                  icon={<BarChart3 className="w-4 h-4" />} 
                  active={currentTab === 'reports'} 
                  onClick={() => handleNavClick('reports')} 
                />
                <NavItem 
                  label="Appointments" 
                  icon={<CalendarDays className="w-4 h-4" />} 
                  active={currentTab === 'appointments'} 
                  onClick={() => handleNavClick('appointments')} 
                />
                <NavItem 
                  label="Suppliers" 
                  icon={<Truck className="w-4 h-4" />} 
                  active={currentTab === 'suppliers'} 
                  onClick={() => handleNavClick('suppliers')} 
                />
                <NavItem 
                  label="Staff" 
                  icon={<UserCog className="w-4 h-4" />} 
                  active={currentTab === 'staff'} 
                  onClick={() => handleNavClick('staff')} 
                />
              </nav>
            </div>

            {/* GENERAL GROUP */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                GENERAL
              </div>
              <nav className="space-y-1">
                <NavItem 
                  label="Settings" 
                  icon={<Settings className="w-4 h-4" />} 
                  active={currentTab === 'settings'} 
                  onClick={() => handleNavClick('settings')} 
                />
                <NavItem 
                  label="Help & Docs" 
                  icon={<HelpCircle className="w-4 h-4" />} 
                  active={false} 
                  onClick={() => alert("Mainframe OS Documentation: Kolhapur Store Operations v2.4. Press Ctrl+K to search any record.")} 
                />
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom promotional/info card as requested in PRD */}
        <div className="p-4 border-t border-[#F1F5F9]">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#087443] to-[#054E2C] p-3.5 text-white shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-[11px] font-bold tracking-wide uppercase text-emerald-100">
                Mainframe Computers
              </span>
            </div>
            <p className="text-[12px] font-medium leading-snug text-white/95">
              "Revive Your Tech, <br />Restore Your Life."
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-emerald-200">
              <span>Kolhapur, MH</span>
              <span className="flex items-center text-[10px] bg-white/15 px-1.5 py-0.5 rounded text-white">
                v2.4
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: string;
  badgeVariant?: 'emerald' | 'amber';
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  label,
  icon,
  active,
  badge,
  badgeVariant = 'emerald',
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all
        ${active 
          ? 'bg-[#087443] text-white font-semibold shadow-xs' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}
      `}
    >
      <div className="flex items-center gap-2.5">
        <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}>
          {icon}
        </span>
        <span>{label}</span>
      </div>

      {badge && (
        <span className={`
          text-[10px] font-bold px-1.5 py-0.5 rounded-full
          ${active 
            ? 'bg-white/20 text-white' 
            : badgeVariant === 'amber'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-100 text-emerald-800'}
        `}>
          {badge}
        </span>
      )}
    </button>
  );
};
