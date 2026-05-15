-- 1. Ensure 'staff' exists in the user_role enum
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'staff') THEN
    ALTER TYPE public.user_role ADD VALUE 'staff';
  END IF;
END $$;

-- 2. Create is_staff helper function
CREATE OR REPLACE FUNCTION public.is_staff(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'staff'
  );
$$;

-- 3. UPDATED RLS: Open up access for staff to students
DROP POLICY IF EXISTS "Staff can view students" ON public.profiles;
DROP POLICY IF EXISTS "Staff Dashboard Access" ON public.profiles;

CREATE POLICY "Staff Student Access" ON public.profiles
  FOR SELECT USING (
    (public.is_staff(auth.uid()) AND (role = 'user'))
    OR (auth.uid() = id)
    OR (public.is_admin(auth.uid()))
  );

-- 4. Fix potential JWT/Session role delay
-- Instead of staff_id, we check 'assigned_sections' which we know was added
UPDATE public.profiles 
SET role = 'staff' 
WHERE role = 'user' 
AND (assigned_sections IS NOT NULL AND assigned_sections != '[]'::jsonb);

-- 5. Open up test_attempts and user_progress for staff
DROP POLICY IF EXISTS "Staff view attempts" ON public.test_attempts;
DROP POLICY IF EXISTS "Staff can view student test attempts" ON public.test_attempts;
CREATE POLICY "Staff view attempts" ON public.test_attempts
  FOR SELECT USING (
    public.is_staff(auth.uid()) OR (auth.uid() = user_id) OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Staff view progress" ON public.user_progress;
DROP POLICY IF EXISTS "Staff can view student progress" ON public.user_progress;
CREATE POLICY "Staff view progress" ON public.user_progress
  FOR SELECT USING (
    public.is_staff(auth.uid()) OR (auth.uid() = user_id) OR public.is_admin(auth.uid())
  );
