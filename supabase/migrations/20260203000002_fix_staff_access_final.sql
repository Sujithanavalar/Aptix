-- 1. Ensure the 'staff' role exists in the enum
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'staff') THEN
    ALTER TYPE public.user_role ADD VALUE 'staff';
  END IF;
END $$;

-- 2. Create the is_staff helper function (re-definition to be safe)
CREATE OR REPLACE FUNCTION public.is_staff(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'staff'
  );
$$;

-- 3. COMPLETELY RESET RLS for profiles to ensure Staff access
-- First, drop any existing conflicting policies
DROP POLICY IF EXISTS "Staff can view students" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view user profiles" ON public.profiles;

-- Create a robust policy for Staff
CREATE POLICY "Staff Dashboard Access" ON public.profiles
  FOR SELECT USING (
    (public.is_staff(auth.uid()) AND (role = 'user')) -- Staff can see all students
    OR (auth.uid() = id) -- Everyone can see themselves
    OR (public.is_admin(auth.uid())) -- Admin can see everything
  );

-- 4. Fix potential JWT/Session role delay by ensuring the current user's role is correctly set
-- This is a one-time fix for existing staff members who might have been created with 'user' role
-- The admin would need to run this or we can rely on the trigger.
UPDATE public.profiles SET role = 'staff' WHERE email IN (
  -- You can manually add emails here if any are stuck, 
  -- but generally the RPC 'create_new_staff' should handle it.
  SELECT email FROM public.profiles WHERE role = 'user' AND (staff_id IS NOT NULL OR assigned_sections != '[]'::jsonb)
);

-- 5. IMPORTANT: Ensure 'test_attempts' and 'user_progress' are also visible to staff
DROP POLICY IF EXISTS "Staff view attempts" ON public.test_attempts;
CREATE POLICY "Staff view attempts" ON public.test_attempts
  FOR SELECT USING (
    public.is_staff(auth.uid()) OR (auth.uid() = user_id) OR public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Staff view progress" ON public.user_progress;
CREATE POLICY "Staff view progress" ON public.user_progress
  FOR SELECT USING (
    public.is_staff(auth.uid()) OR (auth.uid() = user_id) OR public.is_admin(auth.uid())
  );

-- 6. Add a trigger to ensure anyone with a staff_id automatically gets the 'staff' role
CREATE OR REPLACE FUNCTION public.ensure_staff_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.staff_id IS NOT NULL THEN
    NEW.role = 'staff';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_ensure_staff_role ON public.profiles;
CREATE TRIGGER tr_ensure_staff_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_staff_role();
