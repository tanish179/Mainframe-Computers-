import { z } from 'zod';

// Customer Schemas
export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  alternate_phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateCustomerSchema = customerSchema.partial();

// Supplier Schemas
export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  company: z.string().min(1, 'Company name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().nullable(),
  address: z.string().optional().nullable(),
  gst_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateSupplierSchema = supplierSchema.partial();

// Product Schemas
export const productCategoryEnum = z.enum([
  'Laptop', 'Desktop', 'CPU', 'GPU', 'RAM', 'SSD', 'HDD',
  'Motherboard', 'Power Supply', 'Monitor', 'Keyboard', 'Mouse',
  'Printer', 'Cartridge', 'Cable', 'CCTV', 'Accessory', 'Other'
]);

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: productCategoryEnum,
  sku: z.string().min(1, 'SKU is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  serial_number: z.string().optional().nullable(),
  purchase_price: z.number().min(0, 'Purchase price must be non-negative'),
  selling_price: z.number().min(0, 'Selling price must be non-negative'),
  stock_quantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  minimum_stock_level: z.number().int().min(0).default(2),
  supplier_id: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
});

export const updateProductSchema = productSchema.partial();

// Inventory Transaction Schemas
export const inventoryTransactionSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(['stock_in', 'stock_out', 'adjustment', 'damaged', 'returned', 'used_in_service']),
  quantity: z.number().int(),
  reference_type: z.string().optional().nullable(),
  reference_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Employee Schemas
export const employeeSchema = z.object({
  user_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, 'Employee name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email().optional().nullable(),
  role: z.string().default('Technician'),
  status: z.enum(['active', 'inactive']).default('active'),
  joined_at: z.string().optional(),
});

// Service Job Schemas
export const deviceTypeEnum = z.enum(['Laptop', 'Desktop', 'Printer', 'Monitor', 'CCTV', 'Other']);

export const serviceJobStatusEnum = z.enum([
  'received', 'diagnosing', 'waiting_for_customer', 'waiting_for_part',
  'in_repair', 'ready', 'delivered', 'cancelled'
]);

export const priorityLevelEnum = z.enum(['low', 'normal', 'high', 'urgent']);

export const serviceJobSchema = z.object({
  customer_id: z.string().uuid('Valid customer ID is required'),
  device_type: deviceTypeEnum,
  device_brand: z.string().min(1, 'Brand is required'),
  device_model: z.string().min(1, 'Model is required'),
  serial_number: z.string().optional().nullable(),
  customer_problem: z.string().min(1, 'Customer problem description is required'),
  technician_notes: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  estimated_cost: z.number().min(0).default(0),
  final_cost: z.number().min(0).default(0),
  advance_paid: z.number().min(0).default(0),
  priority: priorityLevelEnum.default('normal'),
  expected_date: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  warranty_days: z.number().int().min(0).optional().default(0),
});

export const updateServiceJobSchema = serviceJobSchema.partial().extend({
  status: serviceJobStatusEnum.optional(),
  completed_date: z.string().optional().nullable(),
  delivered_date: z.string().optional().nullable(),
});

export const updateServiceJobStatusSchema = z.object({
  status: serviceJobStatusEnum,
  technician_notes: z.string().optional(),
  final_cost: z.number().min(0).optional(),
});

// Service Job Part Schema
export const serviceJobPartSchema = z.object({
  service_job_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  selling_price: z.number().min(0).optional(),
});

// Sale Schemas
export const saleItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  name: z.string().optional().nullable(),
  quantity: z.number().int().positive('Quantity must be greater than 0').default(1),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  discount: z.number().min(0).default(0),
});

export const saleSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  items: z.array(saleItemSchema).optional().default([]),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  payment_method: z.enum(['cash', 'UPI', 'card', 'bank_transfer', 'other']).optional().default('cash'),
  amount_paid: z.number().min(0).optional(),
});

// Invoice Schemas
export const invoiceSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  sale_id: z.string().uuid().optional().nullable(),
  service_job_id: z.string().uuid().optional().nullable(),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
  issued_date: z.string().optional(),
  due_date: z.string().optional().nullable(),
});

// Payment Schemas
export const paymentSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  invoice_id: z.string().uuid().optional().nullable(),
  sale_id: z.string().uuid().optional().nullable(),
  service_job_id: z.string().uuid().optional().nullable(),
  amount: z.number().positive('Payment amount must be greater than 0'),
  payment_method: z.enum(['cash', 'UPI', 'card', 'bank_transfer', 'other']),
  payment_date: z.string().optional(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Expense Schemas
export const expenseCategoryEnum = z.enum([
  'Rent', 'Electricity', 'Internet', 'Salary', 'Transport', 'Marketing',
  'Software', 'Hardware Purchase', 'Inventory Purchase', 'Tools', 'Maintenance', 'Other'
]);

export const expenseSchema = z.object({
  category: expenseCategoryEnum,
  description: z.string().min(1, 'Expense description is required'),
  amount: z.number().positive('Expense amount must be positive'),
  vendor: z.string().optional().nullable(),
  payment_method: z.enum(['cash', 'UPI', 'card', 'bank_transfer', 'other']),
  expense_date: z.string().optional(),
  reference: z.string().optional().nullable(),
  status: z.enum(['paid', 'pending', 'cancelled']).default('paid'),
  notes: z.string().optional().nullable(),
});

// Report Filter Schema
export const reportFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  customer_id: z.string().uuid().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
});
