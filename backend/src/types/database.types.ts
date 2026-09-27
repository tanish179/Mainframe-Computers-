// Database & Domain Types for Mainframe Computers Business Management System

export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF';
export type UserStatus = 'active' | 'inactive';
export type CustomerStatus = 'active' | 'inactive';
export type SupplierStatus = 'active' | 'inactive';
export type EmployeeStatus = 'active' | 'inactive';

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

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export type InventoryTransactionType =
  | 'stock_in'
  | 'stock_out'
  | 'adjustment'
  | 'damaged'
  | 'returned'
  | 'used_in_service';

export type DeviceType =
  | 'Laptop'
  | 'Desktop'
  | 'Printer'
  | 'Monitor'
  | 'CCTV'
  | 'Other';

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

export type SaleStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'UPI' | 'card' | 'bank_transfer' | 'other';
export type ReceivableStatus =
  | 'pending'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';
export type PayableStatus =
  | 'pending'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Internet'
  | 'Salary'
  | 'Transport'
  | 'Marketing'
  | 'Software'
  | 'Hardware Purchase'
  | 'Inventory Purchase'
  | 'Tools'
  | 'Maintenance'
  | 'Other';

export type ExpenseStatus = 'paid' | 'pending' | 'cancelled';

export type TransactionType =
  | 'income'
  | 'expense'
  | 'refund'
  | 'transfer'
  | 'adjustment';

export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AIAuditStatus = 'success' | 'failed' | 'blocked';

// Entities
export interface Profile {
  id: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessUser {
  id: string;
  user_id: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface BusinessProfile {
  id: string;
  business_name: string;
  business_description?: string | null;
  address: string;
  phone: string;
  email: string;
  gst_number?: string | null;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  alternate_phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  gst_number?: string | null;
  notes?: string | null;
  status: SupplierStatus;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  role: string;
  status: EmployeeStatus;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  sku: string;
  brand: string;
  model: string;
  serial_number?: string | null;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  minimum_stock_level: number;
  supplier_id?: string | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  type: InventoryTransactionType;
  quantity: number;
  reference_type?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ServiceType {
  id: string;
  name: string;
  default_price?: number | null;
  estimated_duration?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceJob {
  id: string;
  customer_id: string;
  job_number: string;
  device_type: DeviceType;
  device_brand: string;
  device_model: string;
  serial_number?: string | null;
  customer_problem: string;
  technician_notes?: string | null;
  diagnosis?: string | null;
  estimated_cost: number;
  final_cost: number;
  advance_paid: number;
  remaining_amount: number;
  status: ServiceJobStatus;
  priority: PriorityLevel;
  received_date: string;
  expected_date?: string | null;
  completed_date?: string | null;
  delivered_date?: string | null;
  assigned_to?: string | null;
  warranty_days?: number | null;
  warranty_start_date?: string | null;
  warranty_end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceJobPart {
  id: string;
  service_job_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  selling_price: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  sale_id?: string | null;
  service_job_id?: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  issued_date: string;
  due_date?: string | null;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  customer_id?: string | null;
  invoice_id?: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_status: PaymentStatus;
  status: SaleStatus;
  sale_date: string;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export interface Payment {
  id: string;
  customer_id: string;
  invoice_id?: string | null;
  sale_id?: string | null;
  service_job_id?: string | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference?: string | null;
  notes?: string | null;
  status: TransactionStatus;
  created_by?: string | null;
  created_at: string;
}

export interface Receivable {
  id: string;
  customer_id: string;
  invoice_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date?: string | null;
  status: ReceivableStatus;
  created_at: string;
  updated_at: string;
}

export interface Payable {
  id: string;
  supplier_id?: string | null;
  description: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date?: string | null;
  status: PayableStatus;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  vendor?: string | null;
  payment_method: PaymentMethod;
  expense_date: string;
  reference?: string | null;
  status: ExpenseStatus;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  reference_type?: string | null;
  reference_id?: string | null;
  description: string;
  payment_method: string;
  transaction_date: string;
  status: TransactionStatus;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface AIAuditLog {
  id: string;
  user_id?: string | null;
  tool_name: string;
  input_params?: Record<string, unknown> | null;
  output_summary?: string | null;
  status: AIAuditStatus;
  created_at: string;
}

export interface BusinessSummary {
  total_income: number;
  total_expenses: number;
  profit: number;
  cash_in: number;
  cash_out: number;
  receivables: number;
  payables: number;
  pending_payments: number;
  overdue_invoices: number;
  active_service_jobs: number;
  completed_service_jobs: number;
  total_sales: number;
  total_customers: number;
  low_stock_items: number;
}
