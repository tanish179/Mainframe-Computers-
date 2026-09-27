-- Migration: 20260927000000_sales_atomic_and_realtime.sql
-- Purpose: Atomic sale transaction RPC, nullability adjustments for service sales, and Realtime publication configuration

-- 1. Table schema adjustments for non-inventory service sales & non-customer sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.sale_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.payments ALTER COLUMN customer_id DROP NOT NULL;

-- 2. Atomic RPC function for creating sales, sale items, payments, ledger transactions, and updating stock
CREATE OR REPLACE FUNCTION public.create_sale_transaction(
    p_customer_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::jsonb,
    p_discount NUMERIC DEFAULT 0.00,
    p_tax NUMERIC DEFAULT 0.00,
    p_payment_method TEXT DEFAULT 'cash',
    p_amount_paid NUMERIC DEFAULT 0.00,
    p_notes TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_sale_id UUID;
    v_subtotal NUMERIC(12,2) := 0.00;
    v_total NUMERIC(12,2) := 0.00;
    v_payment_status TEXT := 'unpaid';
    v_status TEXT := 'completed';
    v_item JSONB;
    v_prod_id UUID;
    v_item_qty INT;
    v_item_price NUMERIC(12,2);
    v_item_disc NUMERIC(12,2);
    v_item_total NUMERIC(12,2);
    v_item_name TEXT;
    v_current_stock INT;
BEGIN
    -- Calculate subtotal from items if present
    IF jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
            v_item_qty := COALESCE((v_item->>'quantity')::INT, 1);
            v_item_price := COALESCE((v_item->>'unit_price')::NUMERIC, 0.00);
            v_item_disc := COALESCE((v_item->>'discount')::NUMERIC, 0.00);
            v_subtotal := v_subtotal + ((v_item_qty * v_item_price) - v_item_disc);
        END LOOP;
    ELSE
        v_subtotal := COALESCE(p_amount_paid, 0.00);
    END IF;

    v_total := GREATEST(0.00, v_subtotal - COALESCE(p_discount, 0.00) + COALESCE(p_tax, 0.00));

    IF p_amount_paid >= v_total AND v_total > 0 THEN
        v_payment_status := 'paid';
    ELSIF p_amount_paid > 0 THEN
        v_payment_status := 'partially_paid';
    ELSE
        v_payment_status := 'unpaid';
    END IF;

    -- Insert into public.sales
    INSERT INTO public.sales (
        customer_id,
        description,
        subtotal,
        discount,
        tax,
        total,
        payment_status,
        status,
        notes,
        created_by
    ) VALUES (
        p_customer_id,
        COALESCE(p_description, 'Sale'),
        v_subtotal,
        COALESCE(p_discount, 0.00),
        COALESCE(p_tax, 0.00),
        v_total,
        v_payment_status,
        v_status,
        p_notes,
        p_created_by
    )
    RETURNING id INTO v_sale_id;

    -- Insert sale items and process inventory if applicable
    IF jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
            v_prod_id := CASE WHEN (v_item->>'product_id') IS NOT NULL AND (v_item->>'product_id') != '' THEN (v_item->>'product_id')::UUID ELSE NULL END;
            v_item_name := COALESCE(v_item->>'name', 'Item');
            v_item_qty := COALESCE((v_item->>'quantity')::INT, 1);
            v_item_price := COALESCE((v_item->>'unit_price')::NUMERIC, 0.00);
            v_item_disc := COALESCE((v_item->>'discount')::NUMERIC, 0.00);
            v_item_total := (v_item_qty * v_item_price) - v_item_disc;

            INSERT INTO public.sale_items (
                sale_id,
                product_id,
                name,
                quantity,
                unit_price,
                discount,
                total
            ) VALUES (
                v_sale_id,
                v_prod_id,
                v_item_name,
                v_item_qty,
                v_item_price,
                v_item_disc,
                v_item_total
            );

            -- Update product stock and inventory transaction if product_id exists
            IF v_prod_id IS NOT NULL THEN
                SELECT stock_quantity INTO v_current_stock FROM public.products WHERE id = v_prod_id FOR UPDATE;
                IF v_current_stock IS NULL THEN
                    RAISE EXCEPTION 'Product with id % not found', v_prod_id;
                END IF;
                IF v_current_stock < v_item_qty THEN
                    RAISE EXCEPTION 'Insufficient stock for product id %. Requested: %, Available: %', v_prod_id, v_item_qty, v_current_stock;
                END IF;

                UPDATE public.products
                SET stock_quantity = stock_quantity - v_item_qty,
                    updated_at = NOW()
                WHERE id = v_prod_id;

                INSERT INTO public.inventory_transactions (
                    product_id,
                    type,
                    quantity,
                    reference_type,
                    reference_id,
                    notes
                ) VALUES (
                    v_prod_id,
                    'stock_out',
                    v_item_qty,
                    'sale',
                    v_sale_id,
                    'Sale ' || v_sale_id::TEXT
                );
            END IF;
        END LOOP;
    END IF;

    -- Record Payment if amount_paid > 0
    IF p_amount_paid > 0 THEN
        INSERT INTO public.payments (
            customer_id,
            sale_id,
            amount,
            payment_method,
            notes,
            status,
            created_by
        ) VALUES (
            p_customer_id,
            v_sale_id,
            p_amount_paid,
            p_payment_method,
            COALESCE(p_notes, 'Payment for sale ' || v_sale_id::TEXT),
            'completed',
            p_created_by
        );

        -- Record transaction entry in financial ledger
        INSERT INTO public.transactions (
            type,
            amount,
            reference_type,
            reference_id,
            description,
            payment_method,
            status
        ) VALUES (
            'income',
            p_amount_paid,
            'sale',
            v_sale_id,
            COALESCE(p_description, 'Sale Payment'),
            p_payment_method,
            'completed'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'sale_id', v_sale_id,
        'total', v_total,
        'payment_status', v_payment_status
    );
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'create_sale_transaction failed: %', SQLERRM;
END;
$$;

-- 3. Configure Supabase Realtime Publication safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY['sales', 'sale_items', 'expenses', 'payments', 'products', 'inventory_transactions', 'invoices'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', t);
        END IF;
    END LOOP;
END $$;
