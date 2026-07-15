-- SSS Boutique Coupons & Banners RLS Migration Script (Phase 9)
-- Execute this script in your Supabase SQL Editor to resolve coupons policy violation errors.

-- 1. Enable Row Level Security (RLS) on coupons, homepage_banners, and reviews tables
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to prevent duplicate errors)
DROP POLICY IF EXISTS "Allow public read coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin full access coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow public read banners" ON public.homepage_banners;
DROP POLICY IF EXISTS "Allow admin full access banners" ON public.homepage_banners;
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow auth users to insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow users to manage own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin full access reviews" ON public.reviews;

-- 3. COUPONS POLICIES
-- Anyone (including guests) can search/read coupon codes to apply discounts during checkout
CREATE POLICY "Allow public read coupons" ON public.coupons
    FOR SELECT
    USING (true);

-- Only Admin and Superadmin can perform insert, update, or delete operations on coupons
CREATE POLICY "Allow admin full access coupons" ON public.coupons
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND (profiles.role = 'admin'::public.user_role_type OR profiles.role = 'superadmin'::public.user_role_type)
        )
    );

-- 4. HOMEPAGE BANNERS POLICIES
-- Anyone can view banners on the home page
CREATE POLICY "Allow public read banners" ON public.homepage_banners
    FOR SELECT
    USING (true);

-- Only Admin/Superadmin can manage home page banners
CREATE POLICY "Allow admin full access banners" ON public.homepage_banners
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND (profiles.role = 'admin'::public.user_role_type OR profiles.role = 'superadmin'::public.user_role_type)
        )
    );

-- 5. REVIEWS POLICIES
-- Anyone can read reviews
CREATE POLICY "Allow public read reviews" ON public.reviews
    FOR SELECT
    USING (true);

-- Authenticated users can insert reviews
CREATE POLICY "Allow auth users to insert reviews" ON public.reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own reviews
CREATE POLICY "Allow users to manage own reviews" ON public.reviews
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Admin can moderate (full access) all reviews
CREATE POLICY "Allow admin full access reviews" ON public.reviews
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND (profiles.role = 'admin'::public.user_role_type OR profiles.role = 'superadmin'::public.user_role_type)
        )
    );
