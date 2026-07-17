-- Phase 10: Add admin read-all policy on profiles table
-- This allows admin/superadmin users to view ALL customer profiles in the Customers tab

-- Drop existing restrictive policy if needed (safe to run multiple times)
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON profiles;

-- Create policy: admins can read all profiles
CREATE POLICY "Allow admins to read all profiles" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND (p.role = 'admin'::public.user_role_type OR p.role = 'superadmin'::public.user_role_type)
  )
);

-- Also allow admins to update any profile (e.g. change role, update phone)
DROP POLICY IF EXISTS "Allow admins to update all profiles" ON profiles;
CREATE POLICY "Allow admins to update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = auth.uid()
      AND (p.role = 'admin'::public.user_role_type OR p.role = 'superadmin'::public.user_role_type)
  )
);
