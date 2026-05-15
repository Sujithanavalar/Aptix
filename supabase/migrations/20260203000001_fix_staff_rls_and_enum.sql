-- 1. Ensure 'staff' exists in the user_role enum
-- Note: 'ALTER TYPE ADD VALUE' cannot run inside a transaction block in some Postgres versions,
-- but standard Supabase migrations handle this.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'staff';

-- 2. Create a helper function to check if a user is a staff member
CREATE OR REPLACE FUNCTION public.is_staff(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'staff'
  );
$$;

-- 3. Update RLS Policies for 'profiles'
-- Allow staff to see all profiles with 'user' role and their own profile
DROP POLICY IF EXISTS "Staff can view students" ON public.profiles;
CREATE POLICY "Staff can view students" ON public.profiles
  FOR SELECT USING (
    (public.is_staff(auth.uid()) AND (role = 'user' OR id = auth.uid()))
    OR (public.is_admin(auth.uid()))
    OR (auth.uid() = id)
  );

-- 4. Update RLS Policies for 'test_attempts'
-- Allow staff to see test attempts of students
DROP POLICY IF EXISTS "Staff can view student test attempts" ON public.test_attempts;
CREATE POLICY "Staff can view student test attempts" ON public.test_attempts
  FOR SELECT USING (
    public.is_staff(auth.uid()) 
    OR (public.is_admin(auth.uid())) 
    OR (auth.uid() = user_id)
  );

-- 5. Update RLS Policies for 'user_progress'
-- Allow staff to see progress of students
DROP POLICY IF EXISTS "Staff can view student progress" ON public.user_progress;
CREATE POLICY "Staff can view student progress" ON public.user_progress
  FOR SELECT USING (
    public.is_staff(auth.uid()) 
    OR (public.is_admin(auth.uid())) 
    OR (auth.uid() = user_id)
  );
