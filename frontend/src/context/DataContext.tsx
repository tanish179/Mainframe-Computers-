import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Customer, 
  Supplier, 
  Product, 
  Transaction, 
  ServiceJob, 
  PendingPayment, 
  TodayTask, 
  StaffMember, 
  Appointment,
  FinancialStats,
  MonthlyChartData,
  RevenueCategoryBreakdown,
  ServiceJobStatus
} from '../types';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS, 
  INITIAL_PRODUCTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SERVICE_JOBS, 
  INITIAL_PENDING_PAYMENTS, 
  INITIAL_TODAY_TASKS,
  INITIAL_STAFF,
  INITIAL_APPOINTMENTS
} from '../data/initialData';
import { 
  calculateFinancialStats, 
  calculateMonthlyTrends, 
  calculateRevenueCategories 
} from '../services/dashboardService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface DataContextType {
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  transactions: Transaction[];
  serviceJobs: ServiceJob[];
  pendingPayments: PendingPayment[];
  todayTasks: TodayTask[];
  staff: StaffMember[];
  appointments: Appointment[];
  
  // Computed values
  stats: FinancialStats;
  monthlyTrends: MonthlyChartData[];
  categoryBreakdown: RevenueCategoryBreakdown[];
  lowStockItems: Product[];
  activeRepairs: ServiceJob[];

  // Mutator actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at'>) => void;
  addSale: (data: { customer_name: string; items_description: string; amount: number; payment_method: any; category: string }) => void;
  addExpense: (data: { description: string; category: string; amount: number; payment_method: any; vendor?: string; notes?: string }) => void;
  newRepair: (data: Omit<ServiceJob, 'id' | 'job_number' | 'created_at'>) => void;
  updateRepairStatus: (jobId: string, status: ServiceJobStatus) => void;
  addCustomer: (cust: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'pending_amount'>) => void;
  addProduct: (prod: Omit<Product, 'id' | 'created_at' | 'status'>) => void;
  recordPayment: (pendingId: string, amountPaid: number, paymentMethod: any) => void;
  toggleTaskStatus: (taskId: string) => void;
  resetToDemoData: () => void;
  isSupabaseLive: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'mf_computers_v2_clean_';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupabaseLive] = useState(isSupabaseConfigured);

  // State initialization
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'serviceJobs');
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_JOBS;
  });

  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'pendingPayments');
    return saved ? JSON.parse(saved) : INITIAL_PENDING_PAYMENTS;
  });

  const [todayTasks, setTodayTasks] = useState<TodayTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'todayTasks');
    return saved ? JSON.parse(saved) : INITIAL_TODAY_TASKS;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  // Fetch initial data from Supabase if connected
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const fetchSupabaseData = async () => {
      try {
        // Fetch Customers safely
        try {
          const { data: dbCustomers, error: custErr } = await client.from('customers').select('*');
          if (!custErr && dbCustomers && dbCustomers.length > 0) {
            const mapped: Customer[] = dbCustomers.map((c: any) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              email: c.email || '',
              address: c.address || '',
              status: c.status || 'active',
              notes: c.notes || '',
              total_spent: 0,
              pending_amount: 0,
              created_at: c.created_at,
            }));
            setCustomers(mapped);
          }
        } catch (_) {}

        // Fetch Products
        const { data: dbProducts } = await client.from('products').select('*');
        if (dbProducts && dbProducts.length > 0) {
          const mapped: Product[] = dbProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            sku: p.sku,
            brand: p.brand,
            model: p.model,
            purchase_price: Number(p.purchase_price || 0),
            selling_price: Number(p.selling_price || 0),
            stock_quantity: p.stock_quantity,
            minimum_stock: p.minimum_stock_level || 2,
            supplier_id: p.supplier_id,
            status: p.stock_quantity <= 0 ? 'Out of Stock' : (p.stock_quantity <= p.minimum_stock_level ? 'Low Stock' : 'In Stock'),
            created_at: p.created_at,
          }));
          setProducts(mapped);
        }

        // Fetch Service Jobs safely
        try {
          const { data: dbJobs, error: jobsErr } = await client.from('service_jobs').select('*, customers(name, phone)');
          if (!jobsErr && dbJobs && dbJobs.length > 0) {
            const mapped: ServiceJob[] = dbJobs.map((j: any) => ({
              id: j.id,
              job_number: j.job_number,
              customer_id: j.customer_id,
              customer_name: j.customers?.name || 'Customer',
              customer_phone: j.customers?.phone || '',
              device_type: j.device_type,
              brand: j.device_brand,
              model: j.device_model,
              serial_number: j.serial_number || '',
              problem_description: j.customer_problem,
              diagnosis: j.diagnosis || '',
              technician_notes: j.technician_notes || '',
              repair_status: j.status,
              priority: j.priority,
              estimated_cost: Number(j.estimated_cost || 0),
              final_cost: Number(j.final_cost || 0),
              advance_paid: Number(j.advance_paid || 0),
              remaining_amount: Number(j.remaining_amount || 0),
              received_date: j.received_date,
              expected_date: j.expected_date || '',
              delivered_date: j.delivered_date || '',
              created_at: j.created_at,
            }));
            setServiceJobs(mapped);
          }
        } catch (_) {}

        // Fetch Transactions
        const { data: dbTx } = await client.from('transactions').select('*');
        if (dbTx && dbTx.length > 0) {
          const mapped: Transaction[] = dbTx.map((t: any) => ({
            id: t.id,
            date: t.transaction_date ? t.transaction_date.split('T')[0] : '',
            description: t.description,
            category: t.type === 'income' ? 'Sales' : 'Maintenance',
            type: t.type === 'income' ? 'income' : 'expense',
            payment_method: t.payment_method || 'cash',
            amount: Number(t.amount || 0),
            status: 'Paid',
            created_at: t.created_at,
          }));
          setTransactions(mapped);
        }
      } catch (err) {
        console.warn('Failed loading initial data from Supabase:', err);
      }
    };

    fetchSupabaseData();
  }, [isSupabaseLive]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'serviceJobs', JSON.stringify(serviceJobs));
  }, [serviceJobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'pendingPayments', JSON.stringify(pendingPayments));
  }, [pendingPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'todayTasks', JSON.stringify(todayTasks));
  }, [todayTasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Dynamic calculations
  const stats = calculateFinancialStats(transactions, pendingPayments);
  const monthlyTrends = calculateMonthlyTrends(transactions);
  const categoryBreakdown = calculateRevenueCategories(transactions);
  const lowStockItems = products.filter(p => p.stock_quantity <= p.minimum_stock);
  const activeRepairs = serviceJobs.filter(j => j.repair_status !== 'delivered' && j.repair_status !== 'cancelled');

  // Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'created_at'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    if (supabase) {
      supabase.from('transactions').insert({
        description: newTx.description,
        type: newTx.type,
        amount: newTx.amount,
        payment_method: newTx.payment_method,
        status: 'completed'
      }).then();
    }
  };

  const addSale = (data: { customer_name: string; items_description: string; amount: number; payment_method: any; category: string }) => {
    const todayStr = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;
    addTransaction({
      date: todayStr,
      description: `${data.items_description} (${data.customer_name})`,
      category: data.category || 'Sales',
      type: 'income',
      payment_method: data.payment_method,
      amount: Number(data.amount),
      status: 'Paid',
      customer_name: data.customer_name
    });
  };

  const addExpense = (data: { description: string; category: string; amount: number; payment_method: any; vendor?: string; notes?: string }) => {
    const todayStr = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;
    addTransaction({
      date: todayStr,
      description: data.vendor ? `${data.description} (${data.vendor})` : data.description,
      category: data.category || 'Maintenance',
      type: 'expense',
      payment_method: data.payment_method,
      amount: Number(data.amount),
      status: 'Paid',
      notes: data.notes
    });

    if (supabase) {
      supabase.from('expenses').insert({
        category: data.category || 'Other',
        description: data.description,
        amount: Number(data.amount),
        vendor: data.vendor || null,
        payment_method: data.payment_method || 'cash',
        notes: data.notes || null,
        status: 'paid'
      }).then();
    }
  };

  const newRepair = (data: Omit<ServiceJob, 'id' | 'job_number' | 'created_at'>) => {
    const nextNum = 1050 + serviceJobs.length;
    const newJob: ServiceJob = {
      ...data,
      id: `job-${Date.now()}`,
      job_number: `MF-REP-${nextNum}`,
      created_at: new Date().toISOString()
    };
    setServiceJobs(prev => [newJob, ...prev]);

    if (data.advance_paid > 0) {
      const todayStr = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;
      addTransaction({
        date: todayStr,
        description: `Advance for ${data.device_type} Repair (${data.customer_name})`,
        category: 'Repair Service',
        type: 'income',
        payment_method: 'UPI',
        amount: data.advance_paid,
        status: 'Paid',
        customer_name: data.customer_name
      });
    }

    if (data.remaining_amount > 0) {
      setPendingPayments(prev => [
        {
          id: `pend-${Date.now()}`,
          customer: data.customer_name,
          customer_id: data.customer_id,
          invoice: `INV-REP-${nextNum}`,
          amount: data.remaining_amount,
          due_date: 'On Delivery',
          status: 'Pending',
          phone: data.customer_phone
        },
        ...prev
      ]);
    }
  };

  const updateRepairStatus = (jobId: string, status: ServiceJobStatus) => {
    setServiceJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          repair_status: status,
          delivered_date: status === 'delivered' ? new Date().toISOString() : j.delivered_date
        };
      }
      return j;
    }));

    if (supabase) {
      supabase.from('service_jobs').update({ status }).eq('id', jobId).then();
    }
  };

  const addCustomer = (cust: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'pending_amount'>) => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      total_spent: 0,
      pending_amount: 0,
      created_at: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCust, ...prev]);

    if (supabase) {
      supabase.from('customers').insert({
        name: cust.name,
        phone: cust.phone,
        email: cust.email || null,
        address: cust.address || null,
        notes: cust.notes || null,
        status: 'active'
      }).then();
    }
  };

  const addProduct = (prod: Omit<Product, 'id' | 'created_at' | 'status'>) => {
    const status = prod.stock_quantity <= 0 ? 'Out of Stock' : (prod.stock_quantity <= prod.minimum_stock ? 'Low Stock' : 'In Stock');
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      status,
      created_at: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProd, ...prev]);

    if (supabase) {
      supabase.from('products').insert({
        name: prod.name,
        category: prod.category,
        sku: prod.sku,
        brand: prod.brand,
        model: prod.model,
        purchase_price: prod.purchase_price,
        selling_price: prod.selling_price,
        stock_quantity: prod.stock_quantity,
        minimum_stock_level: prod.minimum_stock,
        status: 'active'
      }).then();
    }
  };

  const recordPayment = (pendingId: string, amountPaid: number, paymentMethod: any) => {
    const item = pendingPayments.find(p => p.id === pendingId);
    if (!item) return;

    const todayStr = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;
    addTransaction({
      date: todayStr,
      description: `Payment for ${item.invoice} (${item.customer})`,
      category: 'Pending Payment Collected',
      type: 'income',
      payment_method: paymentMethod || 'UPI',
      amount: amountPaid,
      status: 'Paid',
      customer_name: item.customer
    });

    if (amountPaid >= item.amount) {
      setPendingPayments(prev => prev.filter(p => p.id !== pendingId));
    } else {
      setPendingPayments(prev => prev.map(p => {
        if (p.id === pendingId) {
          return {
            ...p,
            amount: p.amount - amountPaid,
            status: 'Partial'
          };
        }
        return p;
      }));
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    setTodayTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: t.status === 'completed' ? 'pending' : 'completed'
        };
      }
      return t;
    }));
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setServiceJobs(INITIAL_SERVICE_JOBS);
    setPendingPayments(INITIAL_PENDING_PAYMENTS);
    setTodayTasks(INITIAL_TODAY_TASKS);
    setStaff(INITIAL_STAFF);
    setAppointments(INITIAL_APPOINTMENTS);
  };

  return (
    <DataContext.Provider value={{
      customers,
      suppliers,
      products,
      transactions,
      serviceJobs,
      pendingPayments,
      todayTasks,
      staff,
      appointments,
      stats,
      monthlyTrends,
      categoryBreakdown,
      lowStockItems,
      activeRepairs,
      addTransaction,
      addSale,
      addExpense,
      newRepair,
      updateRepairStatus,
      addCustomer,
      addProduct,
      recordPayment,
      toggleTaskStatus,
      resetToDemoData,
      isSupabaseLive
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
