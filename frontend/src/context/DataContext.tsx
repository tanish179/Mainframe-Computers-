import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  addSale: (data: { customer_name?: string; items_description: string; amount: number; payment_method: any; category?: string; items?: any[] }) => Promise<void>;
  addExpense: (data: { description: string; category: string; amount: number; payment_method: any; vendor?: string; notes?: string }) => Promise<void>;
  newRepair: (data: Omit<ServiceJob, 'id' | 'job_number' | 'created_at'>) => Promise<void>;
  updateRepairStatus: (jobId: string, status: ServiceJobStatus) => Promise<void>;
  addCustomer: (cust: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'pending_amount'>) => Promise<void>;
  addProduct: (prod: Omit<Product, 'id' | 'created_at' | 'status'>) => Promise<void>;
  recordPayment: (pendingId: string, amountPaid: number, paymentMethod: any) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Pick<Transaction, 'description' | 'amount' | 'payment_method' | 'category' | 'customer_name'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => void;
  resetToDemoData: () => void;
  isSupabaseLive: boolean;
  refreshData: () => Promise<void>;
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

  // Fetch initial & updated data from Supabase
  const fetchSupabaseData = useCallback(async () => {
    const client = supabase;
    if (!client) return;

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
      const { data: dbProducts, error: prodErr } = await client.from('products').select('*');
      if (!prodErr && dbProducts && dbProducts.length > 0) {
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

      // Fetch Transactions
      const { data: dbTx, error: txErr } = await client.from('transactions').select('*').order('created_at', { ascending: false });
      if (!txErr && dbTx && dbTx.length > 0) {
        const mapped: Transaction[] = dbTx.map((t: any) => ({
          id: t.id,
          date: t.transaction_date ? t.transaction_date.split('T')[0] : new Date().toISOString().split('T')[0],
          description: t.description,
          category: t.category || (t.type === 'income' ? 'Sales' : 'Maintenance'),
          type: t.type === 'income' ? 'income' : 'expense',
          payment_method: t.payment_method || 'cash',
          amount: Number(t.amount || 0),
          status: 'Paid',
          customer_name: t.customer_name || '',
          created_at: t.created_at,
        }));
        setTransactions(mapped);
      }
    } catch (err) {
      console.warn('Failed loading data from Supabase:', err);
    }
  }, []);

  // Debounce ref for batching rapid Realtime events
  const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedRefetch = useCallback(() => {
    // Cancel any pending refetch timer
    if (refetchTimerRef.current) {
      clearTimeout(refetchTimerRef.current);
    }
    // Wait 500ms of quiet before doing full refetch
    refetchTimerRef.current = setTimeout(() => {
      fetchSupabaseData();
      refetchTimerRef.current = null;
    }, 500);
  }, [fetchSupabaseData]);

  // Helper: instantly inject a transaction from Realtime payload
  const injectRealtimeTransaction = useCallback((record: any) => {
    if (!record || !record.id) return;
    const mapped: Transaction = {
      id: record.id,
      date: record.transaction_date
        ? record.transaction_date.split('T')[0]
        : new Date().toISOString().split('T')[0],
      description: record.description || 'Transaction',
      category: record.type === 'income' ? 'Sales' : 'Maintenance',
      type: record.type === 'income' ? 'income' : 'expense',
      payment_method: record.payment_method || 'cash',
      amount: Number(record.amount || 0),
      status: 'Paid',
      created_at: record.created_at || new Date().toISOString(),
    };
    setTransactions(prev => {
      // Don't add duplicates
      if (prev.some(t => t.id === mapped.id)) return prev;
      return [mapped, ...prev];
    });
  }, []);

  // Helper: instantly update a product from Realtime payload
  const injectRealtimeProduct = useCallback((record: any) => {
    if (!record || !record.id) return;
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === record.id);
      const mapped: Product = {
        id: record.id,
        name: record.name,
        category: record.category,
        sku: record.sku,
        brand: record.brand,
        model: record.model,
        purchase_price: Number(record.purchase_price || 0),
        selling_price: Number(record.selling_price || 0),
        stock_quantity: record.stock_quantity,
        minimum_stock: record.minimum_stock_level || 2,
        supplier_id: record.supplier_id,
        status: record.stock_quantity <= 0 ? 'Out of Stock' : (record.stock_quantity <= (record.minimum_stock_level || 2) ? 'Low Stock' : 'In Stock'),
        created_at: record.created_at,
      };
      if (idx >= 0) {
        // Update existing product in-place
        const updated = [...prev];
        updated[idx] = mapped;
        return updated;
      }
      return [mapped, ...prev];
    });
  }, []);

  // Set up Supabase Realtime Subscriptions & initial fetch
  useEffect(() => {
    fetchSupabaseData();

    const client = supabase;
    if (!client) return;

    const channel = client
      .channel('public_db_realtime_changes')
      // Instant injection for transactions
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          injectRealtimeTransaction(payload.new);
          debouncedRefetch();
        }
      )
      // Instant injection for product stock updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            injectRealtimeProduct(payload.new);
          }
          debouncedRefetch();
        }
      )
      // All other table changes → just debounced refetch
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => { debouncedRefetch(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sale_items' },
        () => { debouncedRefetch(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => { debouncedRefetch(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => { debouncedRefetch(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_transactions' },
        () => { debouncedRefetch(); }
      )
      .subscribe();

    return () => {
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
      client.removeChannel(channel);
    };
  }, [fetchSupabaseData, isSupabaseLive, debouncedRefetch, injectRealtimeTransaction, injectRealtimeProduct]);

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

  // Actions with proper Error Handling & Realtime database source-of-truth
  const addTransaction = async (tx: Omit<Transaction, 'id' | 'created_at'>) => {
    if (supabase) {
      const { error } = await supabase.from('transactions').insert({
        description: tx.description,
        type: tx.type,
        amount: tx.amount,
        payment_method: tx.payment_method,
        status: 'completed'
      });
      if (error) {
        console.error('Failed to add transaction:', error);
        throw error;
      }
      await fetchSupabaseData();
    } else {
      const newTx: Transaction = {
        ...tx,
        id: `tx-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Pick<Transaction, 'description' | 'amount' | 'payment_method' | 'category' | 'customer_name'>>) => {
    if (supabase) {
      const dbUpdates: Record<string, any> = {};
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.amount !== undefined) dbUpdates.amount = Number(updates.amount);
      if (updates.payment_method !== undefined) dbUpdates.payment_method = updates.payment_method;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.customer_name !== undefined) dbUpdates.customer_name = updates.customer_name || null;

      const { data: tx } = await supabase.from('transactions').select('reference_type, reference_id').eq('id', id).maybeSingle();

      const { error } = await supabase.from('transactions').update(dbUpdates).eq('id', id);
      if (error) {
        console.error('Failed to update transaction:', error);
        throw error;
      }

      if (tx?.reference_type === 'sale' && tx?.reference_id) {
        const saleUpdates: Record<string, any> = {};
        if (updates.description !== undefined) saleUpdates.description = updates.description;
        if (updates.amount !== undefined) saleUpdates.total = Number(updates.amount);
        if (Object.keys(saleUpdates).length > 0) {
          await supabase.from('sales').update(saleUpdates).eq('id', tx.reference_id);
        }
      } else if (tx?.reference_type === 'expense' && tx?.reference_id) {
        const expUpdates: Record<string, any> = {};
        if (updates.description !== undefined) expUpdates.description = updates.description;
        if (updates.amount !== undefined) expUpdates.amount = Number(updates.amount);
        if (updates.category !== undefined) expUpdates.category = updates.category;
        if (updates.payment_method !== undefined) expUpdates.payment_method = updates.payment_method;
        if (Object.keys(expUpdates).length > 0) {
          await supabase.from('expenses').update(expUpdates).eq('id', tx.reference_id);
        }
      }

      await fetchSupabaseData();
    } else {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const deleteTransaction = async (id: string) => {
    if (supabase) {
      const { data: tx } = await supabase.from('transactions').select('reference_type, reference_id').eq('id', id).maybeSingle();
      if (tx?.reference_type === 'sale' && tx?.reference_id) {
        await supabase.from('sale_items').delete().eq('sale_id', tx.reference_id);
        await supabase.from('payments').delete().eq('sale_id', tx.reference_id);
        await supabase.from('sales').delete().eq('id', tx.reference_id);
      } else if (tx?.reference_type === 'expense' && tx?.reference_id) {
        await supabase.from('expenses').delete().eq('id', tx.reference_id);
      }

      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete transaction:', error);
        throw error;
      }
      setTransactions(prev => prev.filter(t => t.id !== id));
      await fetchSupabaseData();
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const addSale = async (data: { customer_name?: string; items_description: string; amount: number; payment_method: any; category?: string; items?: any[] }) => {
    if (supabase) {
      const { error } = await supabase.rpc('create_sale_transaction', {
        p_description: data.items_description || 'Sale',
        p_items: data.items || [],
        p_payment_method: data.payment_method || 'cash',
        p_amount_paid: Number(data.amount)
      });
      if (error) {
        console.error('Failed to add sale:', error);
        throw error;
      }
      await fetchSupabaseData();
    } else {
      const todayStr = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;
      await addTransaction({
        date: todayStr,
        description: `${data.items_description} (${data.customer_name || 'Walk-in'})`,
        category: data.category || 'Sales',
        type: 'income',
        payment_method: data.payment_method,
        amount: Number(data.amount),
        status: 'Paid',
        customer_name: data.customer_name
      });
    }
  };

  const addExpense = async (data: { description: string; category: string; amount: number; payment_method: any; vendor?: string; notes?: string }) => {
    if (supabase) {
      const { data: exp, error: expErr } = await supabase.from('expenses').insert({
        category: data.category || 'Other',
        description: data.description,
        amount: Number(data.amount),
        vendor: data.vendor || null,
        payment_method: data.payment_method || 'cash',
        notes: data.notes || null,
        status: 'paid'
      }).select().single();

      if (expErr) {
        console.error('Failed to add expense:', expErr);
        throw expErr;
      }

      const { error: txErr } = await supabase.from('transactions').insert({
        type: 'expense',
        amount: Number(data.amount),
        reference_type: 'expense',
        reference_id: exp.id,
        description: `Expense (${data.category}): ${data.description}`,
        payment_method: data.payment_method || 'cash',
        status: 'completed'
      });
      if (txErr) console.error('Failed to insert transaction entry:', txErr);

      await fetchSupabaseData();
    } else {
      const todayStr = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;
      await addTransaction({
        date: todayStr,
        description: data.vendor ? `${data.description} (${data.vendor})` : data.description,
        category: data.category || 'Maintenance',
        type: 'expense',
        payment_method: data.payment_method,
        amount: Number(data.amount),
        status: 'Paid',
        notes: data.notes
      });
    }
  };

  const newRepair = async (data: Omit<ServiceJob, 'id' | 'job_number' | 'created_at'>) => {
    const nextNum = 1050 + serviceJobs.length;
    const newJob: ServiceJob = {
      ...data,
      id: `job-${Date.now()}`,
      job_number: `MF-REP-${nextNum}`,
      created_at: new Date().toISOString()
    };
    setServiceJobs(prev => [newJob, ...prev]);
  };

  const updateRepairStatus = async (jobId: string, status: ServiceJobStatus) => {
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
  };

  const addCustomer = async (cust: Omit<Customer, 'id' | 'created_at' | 'total_spent' | 'pending_amount'>) => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      total_spent: 0,
      pending_amount: 0,
      created_at: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCust, ...prev]);
  };

  const addProduct = async (prod: Omit<Product, 'id' | 'created_at' | 'status'>) => {
    if (supabase) {
      const { data: created, error } = await supabase.from('products').insert({
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
      }).select().single();

      if (error) {
        console.error('Failed to add product:', error);
        throw error;
      }

      if (created && prod.stock_quantity > 0) {
        await supabase.from('inventory_transactions').insert({
          product_id: created.id,
          type: 'stock_in',
          quantity: prod.stock_quantity,
          notes: 'Initial stock'
        });
      }

      await fetchSupabaseData();
    } else {
      const status = prod.stock_quantity <= 0 ? 'Out of Stock' : (prod.stock_quantity <= prod.minimum_stock ? 'Low Stock' : 'In Stock');
      const newProd: Product = {
        ...prod,
        id: `prod-${Date.now()}`,
        status,
        created_at: new Date().toISOString().split('T')[0]
      };
      setProducts(prev => [newProd, ...prev]);
    }
  };

  const recordPayment = async (pendingId: string, amountPaid: number, paymentMethod: any) => {
    if (supabase) {
      const { error: payErr } = await supabase.from('payments').insert({
        amount: amountPaid,
        payment_method: paymentMethod || 'UPI',
        status: 'completed',
        notes: `Payment for ${pendingId}`
      });

      if (payErr) {
        console.error('Failed to record payment:', payErr);
        throw payErr;
      }

      const { error: txErr } = await supabase.from('transactions').insert({
        type: 'income',
        amount: amountPaid,
        reference_type: 'payment',
        description: `Payment collected (${paymentMethod})`,
        payment_method: paymentMethod || 'UPI',
        status: 'completed'
      });
      if (txErr) console.error('Failed to insert transaction entry:', txErr);

      await fetchSupabaseData();
    } else {
      const item = pendingPayments.find(p => p.id === pendingId);
      if (!item) return;

      const todayStr = `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })}`;
      await addTransaction({
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
      updateTransaction,
      deleteTransaction,
      toggleTaskStatus,
      resetToDemoData,
      isSupabaseLive,
      refreshData: fetchSupabaseData
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
