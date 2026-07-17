-- SSS Boutique Complete Database Reset SQL Script
-- WARNING: Running this script will permanently delete all products, categories, orders, shipments, carts, wishlists, reviews, coupons, banners, and customer profiles.
-- Admins/Superadmins profiles will NOT be deleted so you do not lock yourself out.

-- Disable all trigger operations (like updated_at triggers) during truncate
SET session_replication_role = 'replica';

-- Wipe all transaction and inventory catalog tables
TRUNCATE TABLE 
    public.shipments, 
    public.order_items, 
    public.orders, 
    public.cart_items, 
    public.carts, 
    public.wishlist, 
    public.addresses, 
    public.reviews, 
    public.coupons, 
    public.homepage_banners, 
    public.activity_logs,
    public.product_variants,
    public.product_images,
    public.products,
    public.categories
    RESTART IDENTITY CASCADE;

-- Clear non-admin customer profiles (prevents admins/superadmins from locking themselves out)
DELETE FROM public.profiles 
WHERE role NOT IN ('admin', 'superadmin');

-- Re-enable triggers
SET session_replication_role = 'origin';
