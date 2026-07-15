-- SSS Boutique GST Migration Script (Phase 8)
-- Execute this script in your Supabase SQL Editor to support the GST Tax Reporting Console.

-- 1. Add tax_inclusive column to products table
ALTER TABLE IF EXISTS public.products 
  ADD COLUMN IF NOT EXISTS tax_inclusive BOOLEAN DEFAULT false;

-- 2. Create gst_logs table to record historical GST collection events
CREATE TABLE IF NOT EXISTS public.gst_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    base_amount DECIMAL(10, 2) NOT NULL,
    gst_amount DECIMAL(10, 2) NOT NULL,
    grand_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Disable Row Level Security on gst_logs to allow seamless order creation inserts
ALTER TABLE public.gst_logs DISABLE ROW LEVEL SECURITY;

-- 4. Enable indexes on gst_logs for faster date-range query scans
CREATE INDEX IF NOT EXISTS idx_gst_logs_created_at ON public.gst_logs(created_at);
