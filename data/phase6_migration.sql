-- 1. Create Shipment Status custom type if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_status_type') THEN
        CREATE TYPE shipment_status_type AS ENUM (
            'Shipment Pending',
            'Packed',
            'Ready For Pickup',
            'Picked Up',
            'In Transit',
            'Out For Delivery',
            'Delivered',
            'Delivery Failed',
            'Returned',
            'Cancelled'
        );
    END IF;
END $$;

-- 2. Create shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    courier_name VARCHAR(255) NOT NULL,
    tracking_number VARCHAR(255) NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'Shipment Pending',
    shipping_date TIMESTAMP WITH TIME ZONE,
    estimated_delivery_date TIMESTAMP WITH TIME ZONE,
    delivered_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    timeline JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create index for performance queries
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON public.shipments(tracking_number);

-- 4. Enable Row Level Security
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Admin / Staff can manage all shipments
CREATE POLICY "Allow admin and staff manage shipments" ON public.shipments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin'::public.user_role_type OR role = 'superadmin'::public.user_role_type OR role = 'super_admin'::public.user_role_type OR role = 'staff'::public.user_role_type)
        )
    );

-- Customers can view their own shipments
CREATE POLICY "Allow customers view own shipments" ON public.shipments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = shipments.order_id
            AND orders.user_id = auth.uid()
        )
    );
