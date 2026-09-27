import React from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { 
  ShoppingCart, 
  Receipt, 
  Wrench, 
  UserPlus, 
  PackagePlus, 
  CreditCard,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'sale' | 'expense' | 'repair' | 'customer' | 'product' | 'payment') => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const actions = [
    {
      id: 'sale' as const,
      title: 'New Customer Sale',
      desc: 'Sell laptop, desktop, cartridge or PC parts',
      icon: <ShoppingCart className="w-5 h-5 text-emerald-700" />,
      bg: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200/70'
    },
    {
      id: 'repair' as const,
      title: 'New Repair Job Ticket',
      desc: 'Intake laptop, printer or CCTV hardware for service',
      icon: <Wrench className="w-5 h-5 text-blue-700" />,
      bg: 'bg-blue-50 hover:bg-blue-100/70 border-blue-200/70'
    },
    {
      id: 'expense' as const,
      title: 'Record Business Expense',
      desc: 'Log rent, electricity, parts stock or staff salary',
      icon: <Receipt className="w-5 h-5 text-amber-700" />,
      bg: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200/70'
    },
    {
      id: 'customer' as const,
      title: 'Register New Customer',
      desc: 'Save contact details, address & billing history',
      icon: <UserPlus className="w-5 h-5 text-purple-700" />,
      bg: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200/70'
    },
    {
      id: 'product' as const,
      title: 'Add Inventory Product',
      desc: 'Register SKU, purchase cost, selling price & alerts',
      icon: <PackagePlus className="w-5 h-5 text-indigo-700" />,
      bg: 'bg-indigo-50 hover:bg-indigo-100/70 border-indigo-200/70'
    },
    {
      id: 'payment' as const,
      title: 'Record Due Payment',
      desc: 'Settle pending invoice or repair balance',
      icon: <CreditCard className="w-5 h-5 text-[#087443]" />,
      bg: 'bg-teal-50 hover:bg-teal-100/70 border-teal-200/70'
    }
  ];

  const handleAction = (id: 'sale' | 'expense' | 'repair' | 'customer' | 'product' | 'payment') => {
    onClose();
    onSelectAction(id);
  };

  return (
    <ModalBackdrop
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Actions Menu"
      subtitle="Select an operation to perform immediately"
      maxWidth="max-w-xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => handleAction(act.id)}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 group cursor-pointer ${act.bg}`}
          >
            <div className="p-2.5 rounded-lg bg-white shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              {act.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 group-hover:text-slate-950 flex items-center justify-between">
                <span>{act.title}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                {act.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </ModalBackdrop>
  );
};
