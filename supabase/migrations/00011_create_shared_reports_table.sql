/*
# Create shared reports table

## Purpose
Store shareable progress reports with unique share IDs for public access.

## Tables Created

### `shared_reports`
- `id` (uuid, primary key) - Unique identifier for the shared report
- `share_id` (text, unique) - Short unique ID for sharing (e.g., 'abc123')
- `user_id` (uuid, references auth.users) - User who created the share
- `username` (text) - Username at time of sharing
- `report_data` (jsonb) - Complete report data including stats and charts
- `created_at` (timestamptz) - When the report was shared
- `expires_at` (timestamptz) - Optional expiration date
- `view_count` (integer) - Number of times the report was viewed

## Security
- Public read access for shared reports (anyone with link can view)
- Only authenticated users can create shared reports
- Users can only create reports for themselves

## Notes
- Share IDs are short, URL-friendly strings
- Reports include snapshot of user's progress at time of sharing
- View count tracks engagement
*/

CREATE TABLE IF NOT EXISTS shared_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text NOT NULL,
  report_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz,
  view_count integer DEFAULT 0 NOT NULL
);

ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'shared_reports' AND policyname = 'Anyone can view shared reports'
  ) THEN
    CREATE POLICY "Anyone can view shared reports" ON shared_reports
      FOR SELECT
      USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'shared_reports' AND policyname = 'Users can create own shared reports'
  ) THEN
    CREATE POLICY "Users can create own shared reports" ON shared_reports
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'shared_reports' AND policyname = 'Users can delete own shared reports'
  ) THEN
    CREATE POLICY "Users can delete own shared reports" ON shared_reports
      FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_shared_reports_share_id ON shared_reports(share_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_user_id ON shared_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_created_at ON shared_reports(created_at DESC);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_report_view_count(report_share_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE shared_reports
  SET view_count = view_count + 1
  WHERE share_id = report_share_id;
END;
$$;
