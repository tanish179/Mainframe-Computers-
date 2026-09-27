-- Migration: 20260926000001_rls_policies.sql
-- Purpose: Enable Row Level Security (RLS) and define access control policies for Mainframe Computers system

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_job_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check active authenticated business user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT role FROM public.business_users 
    WHERE user_id = auth.uid() AND status = 'active'
    LIMIT 1;
$$;

-- PROFILES POLICIES
CREATE POLICY "Profiles viewable by authenticated business users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- BUSINESS USERS POLICIES
CREATE POLICY "Business users viewable by authenticated users"
    ON public.business_users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only OWNER or ADMIN can manage business users"
    ON public.business_users FOR ALL
    TO authenticated
    USING (public.get_current_user_role() IN ('OWNER', 'ADMIN'));

-- BUSINESS PROFILE POLICIES
CREATE POLICY "Business profile viewable by authenticated users"
    ON public.business_profile FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only OWNER or ADMIN can update business profile"
    ON public.business_profile FOR UPDATE
    TO authenticated
    USING (public.get_current_user_role() IN ('OWNER', 'ADMIN'));

-- STANDARD DOMAIN TABLES POLICIES (customers, suppliers, employees, products, inventory_transactions, service_types, service_jobs, service_job_parts, invoices, sales, sale_items, payments, receivables, payables, expenses, transactions, activity_logs, ai_audit_logs)
-- Authenticated active business users can select, insert, and update operational data.

-- CUSTOMERS READ POLICY (ALLOW ANON AND AUTHENTICATED)
DROP POLICY IF EXISTS "customers_read_policy" ON public.customers;
CREATE POLICY "customers_read_policy"
ON public.customers
FOR SELECT
TO anon, authenticated
USING (true);

DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'suppliers', 'employees', 'products', 'inventory_transactions',
        'service_types', 'service_jobs', 'service_job_parts', 'invoices', 'sales',
        'sale_items', 'payments', 'receivables', 'payables', 'expenses',
        'transactions', 'activity_logs', 'ai_audit_logs'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('
            CREATE POLICY "%s_read_policy" ON public.%I
                FOR SELECT TO authenticated USING (true);
            CREATE POLICY "%s_insert_policy" ON public.%I
                FOR INSERT TO authenticated WITH CHECK (public.get_current_user_role() IS NOT NULL);
            CREATE POLICY "%s_update_policy" ON public.%I
                FOR UPDATE TO authenticated USING (public.get_current_user_role() IS NOT NULL);
        ', t, t, t, t, t, t);
    END LOOP;
END $$;

