// Type definitions for Mainframe Computers Business Management Dashboard

export type NavTab = 
  | 'dashboard'
  | 'transactions'
  | 'sales'
  | 'expenses'
  | 'repairs'
  | 'customers'
  | 'inventory'
  | 'reports'
  | 'appointments'
  | 'suppliers'
  | 'staff'
  | 'settings';

export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF';

export type TransactionType = 'income' | 'expense' | 'refund' | 'transfer' | 'adjustment';
export type PaymentMethod = 'cash' | 'UPI' | 'card' | 'bank_transfer' | 'other';
export type TransactionStatus = 'paid' | 'pending' | 'partial' | 'completed' | 'failed' | 'cancelled';

export type ServiceJobStatus =
  | 'received'
  | 'diagnosing'
  | 'waiting_for_customer'
  | 'waiting_for_part'
  | 'in_repair'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent';

export type ProductCategory =
  | 'Laptop'
  | 'Desktop'
  | 'CPU'
  | 'GPU'
  | 'RAM'
  | 'SSD'
  | 'HDD'
  | 'Motherboard'
  | 'Power Supply'
  | 'Monitor'
  | 'Keyboard'
  | 'Mouse'
  | 'Printer'
  | 'Cartridge'
  | 'Cable'
  | 'CCTV'
  | 'Accessory'
  | 'Other';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  status?: 'active' | 'inactive';
  notes?: string;
  total_spent: number;
  pending_amount: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  address?: string;
  gst_number?: string;
  products_supplied?: string;
  total_purchases: number;
  pending_payable: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  sku: string;
  brand: string;
  model: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  minimum_stock: number;
  supplier_id?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  payment_method: PaymentMethod;
  amount: number;
  status: 'Paid' | 'Pending' | 'Partial';
  customer_id?: string;
  customer_name?: string;
  supplier_id?: string;
  supplier_name?: string;
  invoice_id?: string;
  notes?: string;
  created_at: string;
}

export interface ServiceJob {
  id: string;
  job_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  device_type: 'Laptop' | 'Desktop' | 'Printer' | 'Monitor' | 'CCTV' | 'Other';
  brand: string;
  model: string;
  serial_number?: string;
  problem_description: string;
  diagnosis?: string;
  technician_notes?: string;
  repair_status: ServiceJobStatus;
  priority: PriorityLevel;
  estimated_cost: number;
  final_cost: number;
  advance_paid: number;
  remaining_amount: number;
  received_date: string;
  expected_date: string;
  delivered_date?: string;
  assigned_staff?: string;
  parts_used?: Array<{ name: string; cost: number }>;
  created_at: string;
}

export interface PendingPayment {
  id: string;
  customer: string;
  customer_id: string;
  invoice: string;
  amount: number;
  due_date: string;
  status: 'Pending' | 'Overdue' | 'Partial';
  phone?: string;
}

export interface TodayTask {
  id: string;
  time: string;
  title: string;
  client: string;
  type: 'repair' | 'cctv' | 'delivery' | 'followup' | 'pc_build';
  status: 'pending' | 'completed' | 'in_progress';
}

export interface FinancialStats {
  total_income: number;
  income_growth_pct: number;
  total_expenses: number;
  expense_growth_pct: number;
  net_profit: number;
  profit_growth_pct: number;
  pending_payments_total: number;
  pending_customers_count: number;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface RevenueCategoryBreakdown {
  name: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  active_jobs: number;
  completed_jobs: number;
  joined_date: string;
}

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_type: string;
  date: string;
  time: string;
  assigned_technician: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
