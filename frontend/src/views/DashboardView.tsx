import React from 'react';
import { FinancialCards } from '../components/dashboard/FinancialCards';
import { MainFinancialAnalytics } from '../components/dashboard/MainFinancialAnalytics';
import { CashFlowCard } from '../components/dashboard/CashFlowCard';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { PendingPaymentsCard } from '../components/dashboard/PendingPaymentsCard';
import { ActiveRepairsCard } from '../components/dashboard/ActiveRepairsCard';
import { InventoryAlertsCard } from '../components/dashboard/InventoryAlertsCard';
import { TodayWorkCard } from '../components/dashboard/TodayWorkCard';
import { BusinessOverviewCard } from '../components/dashboard/BusinessOverviewCard';
import { Plus, Sparkles, SlidersHorizontal } from 'lucide-react';
import { NavTab, ServiceJob, PendingPayment } from '../types';

interface DashboardViewProps {
  onOpenAddTransaction: () => void;
  onOpenQuickActions: () => void;
  onNavigateToTab: (tab: NavTab) => void;
  onSelectRepair: (repair: ServiceJob) => void;
  onRecordPaymentClick: (item?: PendingPayment) => void;
  onAddProductClick: () => void;
  onNewRepairClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddTransaction,
  onOpenQuickActions,
  onNavigateToTab,
  onSelectRepair,
  onRecordPaymentClick,
  onAddProductClick,
  onNewRepairClick,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1520px] mx-auto pb-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Business Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Monitor your business, finances and daily operations.
          </p>
        </div>

        {/* Primary and Secondary Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onOpenQuickActions}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-800 text-xs sm:text-[13px] font-bold rounded-xl shadow-2xs transition-all hover:border-slate-300"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Quick Actions</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-[#087443] hover:bg-[#065F37] text-white text-xs sm:text-[13px] font-bold rounded-xl shadow-xs transition-all hover:shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <FinancialCards />

      {/* Row 2: Large Analytics Chart (65%) + Cash Flow (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <MainFinancialAnalytics />
        </div>
        <div className="lg:col-span-4">
          <CashFlowCard />
        </div>
      </div>

      {/* Row 3: Recent Transactions (65%) + Pending Payments (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RecentTransactions 
            onNavigateToTab={onNavigateToTab} 
            onOpenAddTransaction={onOpenAddTransaction} 
          />
        </div>
        <div className="lg:col-span-4">
          <PendingPaymentsCard 
            onRecordPaymentClick={onRecordPaymentClick}
            onViewAllClick={() => onNavigateToTab('transactions')}
          />
        </div>
      </div>

      {/* Row 4: Active Repairs (50%) + Inventory Alerts (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveRepairsCard 
          onSelectRepair={onSelectRepair}
          onViewAllRepairs={() => onNavigateToTab('repairs')}
          onNewRepairClick={onNewRepairClick}
        />
        <InventoryAlertsCard 
          onNavigateToTab={onNavigateToTab}
          onAddProductClick={onAddProductClick}
        />
      </div>

      {/* Row 5: Today's Work Schedule (50%) + Business Overview Breakdown (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayWorkCard />
        <BusinessOverviewCard />
      </div>
    </div>
  );
};
