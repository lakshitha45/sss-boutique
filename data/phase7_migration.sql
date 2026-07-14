-- Phase 7: Communication & Notification System Migration

-- 1. Alter notifications table to add new columns
ALTER TABLE IF EXISTS public.notifications
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id),
  ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'in_app',
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON public.notifications(order_id);

-- 2. Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'email',
    provider VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    event_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_event_type ON public.notification_logs(event_type);

-- 3. Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    order_emails BOOLEAN DEFAULT true,
    shipment_emails BOOLEAN DEFAULT true,
    promotional_emails BOOLEAN DEFAULT true,
    account_emails BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- 4. Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for notification_logs
CREATE POLICY "Allow admin manage notification_logs" ON public.notification_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role::text = 'admin' OR role::text = 'superadmin' OR role::text = 'super_admin')
        )
    );

-- 6. RLS Policies for notification_preferences
CREATE POLICY "Allow users manage own preferences" ON public.notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- 7. Update notifications RLS to allow users to see their own notifications
CREATE POLICY "Allow users view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- 8. Alter categories and products tables to support active, display_order and SEO metadata fields
ALTER TABLE IF EXISTS public.categories
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 9. Row Level Security policies for categories, products, images and variants
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_variants ENABLE ROW LEVEL SECURITY;

-- Categories RLS policies
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage categories" ON public.categories;
CREATE POLICY "Allow admin manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role::text = 'admin' OR role::text = 'superadmin' OR role::text = 'super_admin')
        )
    );

-- Products RLS policies
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage products" ON public.products;
CREATE POLICY "Allow admin manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role::text = 'admin' OR role::text = 'superadmin' OR role::text = 'super_admin')
        )
    );

-- Product Images RLS policies
DROP POLICY IF EXISTS "Allow public read product_images" ON public.product_images;
CREATE POLICY "Allow public read product_images" ON public.product_images
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage product_images" ON public.product_images;
CREATE POLICY "Allow admin manage product_images" ON public.product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role::text = 'admin' OR role::text = 'superadmin' OR role::text = 'super_admin')
        )
    );

-- Product Variants RLS policies
DROP POLICY IF EXISTS "Allow public read product_variants" ON public.product_variants;
CREATE POLICY "Allow public read product_variants" ON public.product_variants
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage product_variants" ON public.product_variants;
CREATE POLICY "Allow admin manage product_variants" ON public.product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role::text = 'admin' OR role::text = 'superadmin' OR role::text = 'super_admin')
        )
    );


