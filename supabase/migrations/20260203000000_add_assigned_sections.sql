-- Add assigned_sections column to profiles table to support multiple class assignments for staff
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_sections jsonb DEFAULT '[]'::jsonb;

-- Comment on the column for clarity
COMMENT ON COLUMN public.profiles.assigned_sections IS 'Stores an array of {department, year, section} objects for staff members.';

-- Create an index for better performance when querying JSONB (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_sections ON public.profiles USING gin (assigned_sections);
