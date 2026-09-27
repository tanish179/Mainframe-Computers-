import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NavTab, ServiceJob, PendingPayment } from './types';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { InventoryView } from './views/InventoryView';
import { SalesView } from './views/SalesView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { AppointmentsView } from './views/AppointmentsView';
import { SuppliersView } from './views/SuppliersView';
import { StaffView } from './views/StaffView';
import { SettingsView } from './views/SettingsView';

// Modals
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { AddSaleModal } from './components/modals/AddSaleModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { NewRepairModal } from './components/modals/NewRepairModal';
import { AddCustomerModal } from './components/modals/AddCustomerModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { RepairDetailModal } from './components/modals/RepairDetailModal';
import { QuickActionsModal } from './components/modals/QuickActionsModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isNewRepairOpen, setIsNewRepairOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedPendingPayment, setSelectedPendingPayment] = useState<PendingPayment | null>(null);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [selectedRepairJob, setSelectedRepairJob] = useState<ServiceJob | null>(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K opens Quick Actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickActionsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenRecordPayment = (item?: PendingPayment) => {
    setSelectedPendingPayment(item || null);
    setIsRecordPaymentOpen(true);
  };

  const handleSelectQuickAction = (action: 'sale' | 'expense' | 'repair' | 'customer' | 'product' | 'payment') => {
    switch (action) {
      case 'sale':
        setIsAddSaleOpen(true);
        break;
      case 'expense':
        setIsAddExpenseOpen(true);
        break;
      case 'repair':
        setIsNewRepairOpen(true);
        break;
      case 'customer':
        setIsAddCustomerOpen(true);
        break;
      case 'product':
        setIsAddProductOpen(true);
        break;
      case 'payment':
        handleOpenRecordPayment();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F5] text-slate-900 flex font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area (shifted left by 256px on lg screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickActions={() => setIsQuickActionsOpen(true)}
          onSearchFocus={() => setIsQuickActionsOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
              onOpenQuickActions={() => setIsQuickActionsOpen(true)}
              onNavigateToTab={setCurrentTab}
              onSelectRepair={(job) => setSelectedRepairJob(job)}
              onRecordPaymentClick={handleOpenRecordPayment}
              onAddProductClick={() => setIsAddProductOpen(true)}
              onNewRepairClick={() => setIsNewRepairOpen(true)}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              onOpenAddTransaction={() => setIsAddTransactionOpen(true)}
            />
          )}

          {currentTab === 'sales' && (
            <SalesView
              onOpenAddSale={() => setIsAddSaleOpen(true)}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              onOpenAddProduct={() => setIsAddProductOpen(true)}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView />
          )}

          {currentTab === 'suppliers' && (
            <SuppliersView />
          )}

          {currentTab === 'staff' && (
            <StaffView />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Global Modals Suite */}
      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
      />

      <AddSaleModal
        isOpen={isAddSaleOpen}
        onClose={() => setIsAddSaleOpen(false)}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      <NewRepairModal
        isOpen={isNewRepairOpen}
        onClose={() => setIsNewRepairOpen(false)}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setSelectedPendingPayment(null);
        }}
        initialItem={selectedPendingPayment}
      />

      <RepairDetailModal
        job={selectedRepairJob}
        isOpen={Boolean(selectedRepairJob)}
        onClose={() => setSelectedRepairJob(null)}
      />

      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />
    </div>
  );
};
export default App;
