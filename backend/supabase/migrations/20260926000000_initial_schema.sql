-- Migration: 20260926000000_initial_schema.sql
-- Purpose: Initial core database schema for Mainframe Computers Business System

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BUSINESS USERS
CREATE TABLE IF NOT EXISTS public.business_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'STAFF')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. BUSINESS PROFILE
CREATE TABLE IF NOT EXISTS public.business_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL DEFAULT 'Mainframe Computers',
    business_description TEXT,
    address TEXT NOT NULL DEFAULT 'Kolhapur, Maharashtra, India',
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    gst_number TEXT,
    currency TEXT NOT NULL DEFAULT 'INR',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- 5. SUPPLIERS
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    gst_number TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EMPLOYEES
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'Technician',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Laptop', 'Desktop', 'CPU', 'GPU', 'RAM', 'SSD', 'HDD',
        'Motherboard', 'Power Supply', 'Monitor', 'Keyboard', 'Mouse',
        'Printer', 'Cartridge', 'Cable', 'CCTV', 'Accessory', 'Other'
    )),
    sku TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT,
    purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (purchase_price >= 0),
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (selling_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    minimum_stock_level INT NOT NULL DEFAULT 2 CHECK (minimum_stock_level >= 0),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock_quantity);

-- 8. INVENTORY TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'adjustment', 'damaged', 'returned', 'used_in_service')),
    quantity INT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_tx_product ON public.inventory_transactions(product_id);

-- 9. SERVICE TYPES
CREATE TABLE IF NOT EXISTS public.service_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    default_price NUMERIC(12,2) CHECK (default_price >= 0),
    estimated_duration TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SERVICE JOBS
CREATE TABLE IF NOT EXISTS public.service_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    job_number TEXT UNIQUE NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('Laptop', 'Desktop', 'Printer', 'Monitor', 'CCTV', 'Other')),
    device_brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    serial_number TEXT,
    customer_problem TEXT NOT NULL,
    technician_notes TEXT,
    diagnosis TEXT,
    estimated_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (estimated_cost >= 0),
    final_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (final_cost >= 0),
    advance_paid NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (advance_paid >= 0),
    remaining_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (remaining_amount >= 0),
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
        'received', 'diagnosing', 'waiting_for_customer', 'waiting_for_part',
        'in_repair', 'ready', 'delivered', 'cancelled'
    )),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    received_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_date TIMESTAMPTZ,
    completed_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    warranty_days INT DEFAULT 0 CHECK (warranty_days >= 0),
    warranty_start_date DATE,
    warranty_end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_jobs_customer ON public.service_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_jobs_status ON public.service_jobs(status);
CREATE INDEX IF NOT EXISTS idx_service_jobs_number ON public.service_jobs(job_number);

-- 11. SERVICE JOB PARTS
CREATE TABLE IF NOT EXISTS public.service_job_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_job_id UUID NOT NULL REFERENCES public.service_jobs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (unit_cost >= 0),
    selling_price NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (selling_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    sale_id UUID,
    service_job_id UUID REFERENCES public.service_jobs(id) ON DELETE SET NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    tax NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    total NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- 13. SALES
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    tax NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    total NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'refunded')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'completed', 'cancelled')),
    sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint to invoices.sale_id now that sales table exists
ALTER TABLE public.invoices ADD CONSTRAINT fk_invoices_sale FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE SET NULL;

-- 14. SALE ITEMS
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    discount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    total NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total >= 0)
);

-- 15. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    service_job_id UUID REFERENCES public.service_jobs(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'UPI', 'card', 'bank_transfer', 'other')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reference TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. RECEIVABLES
CREATE TABLE IF NOT EXISTS public.receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    remaining_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (remaining_amount >= 0),
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. PAYABLES
CREATE TABLE IF NOT EXISTS public.payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    remaining_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (remaining_amount >= 0),
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN (
        'Rent', 'Electricity', 'Internet', 'Salary', 'Transport', 'Marketing',
        'Software', 'Hardware Purchase', 'Inventory Purchase', 'Tools', 'Maintenance', 'Other'
    )),
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    vendor TEXT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'UPI', 'card', 'bank_transfer', 'other')),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference TEXT,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. TRANSACTIONS (Financial Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'refund', 'transfer', 'adjustment')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    reference_type TEXT,
    reference_id UUID,
    description TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);

-- 20. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. AI AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tool_name TEXT NOT NULL,
    input_params JSONB DEFAULT '{}'::jsonb,
    output_summary TEXT,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
