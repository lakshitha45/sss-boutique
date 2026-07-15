-- SSS Boutique: Clean up old fake tracking numbers
-- Run this in your Supabase SQL Editor to remove the auto-assigned 
-- "SSS-DELHIVERY-XXXXXX" tracking numbers from existing orders.
-- These were incorrectly assigned at checkout before the fix.

UPDATE public.orders
SET tracking_number = NULL
WHERE tracking_number LIKE 'SSS-DELHIVERY-%';
