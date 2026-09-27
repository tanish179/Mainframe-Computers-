-- Migration: 20260926000002_functions_and_triggers.sql
-- Purpose: Stored procedures, sequences, and trigger functions for Mainframe Computers business logic

-- 1. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all table entities with updated_at column
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'profiles', 'business_profile', 'customers', 'suppliers', 'employees',
        'products', 'service_types', 'service_jobs', 'invoices', 'sales',
        'receivables', 'payables', 'expenses'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_timestamp_%I ON public.%I;
            CREATE TRIGGER set_timestamp_%I
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.trigger_set_timestamp();
        ', t, t, t, t);
    END LOOP;
END $$;

-- 2. SEQUENCES FOR JOB & INVOICE NUMBERS
CREATE SEQUENCE IF NOT EXISTS public.job_number_seq START WITH 1001 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 5001 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION public.generate_job_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'MJ-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('public.job_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEXTVAL('public.invoice_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. FUNCTION TO AGGREGATE DASHBOARD BUSINESS SUMMARY
CREATE OR REPLACE FUNCTION public.get_business_summary(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_start TIMESTAMPTZ := COALESCE(p_start_date, '1970-01-01'::TIMESTAMPTZ);
    v_end TIMESTAMPTZ := COALESCE(p_end_date, NOW());
    
    v_total_income NUMERIC(12,2) := 0.00;
    v_total_expenses NUMERIC(12,2) := 0.00;
    v_profit NUMERIC(12,2) := 0.00;
    v_cash_in NUMERIC(12,2) := 0.00;
    v_cash_out NUMERIC(12,2) := 0.00;
    v_receivables NUMERIC(12,2) := 0.00;
    v_payables NUMERIC(12,2) := 0.00;
    v_pending_payments NUMERIC(12,2) := 0.00;
    v_overdue_invoices INT := 0;
    v_active_service_jobs INT := 0;
    v_completed_service_jobs INT := 0;
    v_total_sales INT := 0;
    v_total_customers INT := 0;
    v_low_stock_items INT := 0;
BEGIN
    -- Income from transactions
    SELECT COALESCE(SUM(amount), 0.00) INTO v_total_income
    FROM public.transactions
    WHERE type = 'income' AND status = 'completed'
      AND transaction_date >= v_start AND transaction_date <= v_end;

    -- Expenses from transactions
    SELECT COALESCE(SUM(amount), 0.00) INTO v_total_expenses
    FROM public.transactions
    WHERE type = 'expense' AND status = 'completed'
      AND transaction_date >= v_start AND transaction_date <= v_end;

    v_profit := v_total_income - v_total_expenses;

    -- Cash in (payments received)
    SELECT COALESCE(SUM(amount), 0.00) INTO v_cash_in
    FROM public.payments
    WHERE status = 'completed'
      AND payment_date >= v_start AND payment_date <= v_end;

    -- Cash out (expenses paid)
    SELECT COALESCE(SUM(amount), 0.00) INTO v_cash_out
    FROM public.expenses
    WHERE status = 'paid'
      AND expense_date >= v_start::DATE AND expense_date <= v_end::DATE;

    -- Receivables (outstanding)
    SELECT COALESCE(SUM(remaining_amount), 0.00) INTO v_receivables
    FROM public.receivables
    WHERE status IN ('pending', 'partially_paid', 'overdue');

    -- Payables (outstanding)
    SELECT COALESCE(SUM(remaining_amount), 0.00) INTO v_payables
    FROM public.payables
    WHERE status IN ('pending', 'partially_paid', 'overdue');

    -- Pending payments total
    v_pending_payments := v_receivables;

    -- Overdue invoices count
    SELECT COUNT(*) INTO v_overdue_invoices
    FROM public.invoices
    WHERE status = 'overdue' OR (status IN ('issued', 'partially_paid') AND due_date < CURRENT_DATE);

    -- Active service jobs
    SELECT COUNT(*) INTO v_active_service_jobs
    FROM public.service_jobs
    WHERE status IN ('received', 'diagnosing', 'waiting_for_customer', 'waiting_for_part', 'in_repair', 'ready');

    -- Completed service jobs
    SELECT COUNT(*) INTO v_completed_service_jobs
    FROM public.service_jobs
    WHERE status = 'delivered'
      AND updated_at >= v_start AND updated_at <= v_end;

    -- Total confirmed/completed sales count
    SELECT COUNT(*) INTO v_total_sales
    FROM public.sales
    WHERE status IN ('confirmed', 'completed')
      AND sale_date >= v_start AND sale_date <= v_end;

    -- Total customers count
    SELECT COUNT(*) INTO v_total_customers
    FROM public.customers
    WHERE status = 'active';

    -- Low stock items count
    SELECT COUNT(*) INTO v_low_stock_items
    FROM public.products
    WHERE stock_quantity <= minimum_stock_level AND status = 'active';

    RETURN jsonb_build_object(
        'total_income', v_total_income,
        'total_expenses', v_total_expenses,
        'profit', v_profit,
        'cash_in', v_cash_in,
        'cash_out', v_cash_out,
        'receivables', v_receivables,
        'payables', v_payables,
        'pending_payments', v_pending_payments,
        'overdue_invoices', v_overdue_invoices,
        'active_service_jobs', v_active_service_jobs,
        'completed_service_jobs', v_completed_service_jobs,
        'total_sales', v_total_sales,
        'total_customers', v_total_customers,
        'low_stock_items', v_low_stock_items
    );
END;
$$;
