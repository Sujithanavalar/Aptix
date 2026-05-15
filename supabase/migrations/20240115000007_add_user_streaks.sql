/*
# Add User Streaks Table

1. New Tables
  - `user_streaks`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users, unique)
    - `current_streak` (integer, default 0)
    - `longest_streak` (integer, default 0)
    - `last_login_date` (date, not null)
    - `created_at` (timestamptz, default now())
    - `updated_at` (timestamptz, default now())

2. Indexes
  - Unique index on user_id
  - Index on last_login_date for queries

3. Security
  - Enable RLS on `user_streaks` table
  - Users can read their own streak
  - Users can insert/update their own streak
  - Admins have full access

4. Functions
  - Function to update user streak (handles consecutive day logic)
  - Function to get user streak

5. Notes
  - Streak increments on consecutive day logins
  - Streak resets if user misses a day
  - Tracks longest streak achieved
  - Persists across devices and browsers
*/

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak integer DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
  longest_streak integer DEFAULT 0 NOT NULL CHECK (longest_streak >= 0),
  last_login_date date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_login ON user_streaks(last_login_date);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_streaks' AND policyname = 'Users can view own streak'
  ) THEN
    CREATE POLICY "Users can view own streak" ON user_streaks
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_streaks' AND policyname = 'Users can insert own streak'
  ) THEN
    CREATE POLICY "Users can insert own streak" ON user_streaks
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_streaks' AND policyname = 'Users can update own streak'
  ) THEN
    CREATE POLICY "Users can update own streak" ON user_streaks
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_streaks' AND policyname = 'Admins have full access to streaks'
  ) THEN
    CREATE POLICY "Admins have full access to streaks" ON user_streaks
      FOR ALL TO authenticated USING (is_admin(auth.uid()));
  END IF;
END
$$;

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_streak integer;
  v_longest_streak integer;
  v_last_login date;
  v_today date := CURRENT_DATE;
  v_diff_days integer;
BEGIN
  -- Get existing streak data
  SELECT current_streak, longest_streak, last_login_date
  INTO v_current_streak, v_longest_streak, v_last_login
  FROM user_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- First time login - create new streak
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_login_date)
    VALUES (p_user_id, 1, 1, v_today);
    
    RETURN json_build_object(
      'current_streak', 1,
      'longest_streak', 1,
      'last_login_date', v_today
    );
  END IF;

  -- Calculate days difference
  v_diff_days := v_today - v_last_login;

  IF v_diff_days = 0 THEN
    -- Same day login - no change
    RETURN json_build_object(
      'current_streak', v_current_streak,
      'longest_streak', v_longest_streak,
      'last_login_date', v_last_login
    );
  ELSIF v_diff_days = 1 THEN
    -- Consecutive day - increment streak
    v_current_streak := v_current_streak + 1;
    v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    
    UPDATE user_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_login_date = v_today,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN json_build_object(
      'current_streak', v_current_streak,
      'longest_streak', v_longest_streak,
      'last_login_date', v_today
    );
  ELSE
    -- Streak broken - reset to 1
    UPDATE user_streaks
    SET current_streak = 1,
        last_login_date = v_today,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN json_build_object(
      'current_streak', 1,
      'longest_streak', v_longest_streak,
      'last_login_date', v_today
    );
  END IF;
END;
$$;

-- Function to get user streak
CREATE OR REPLACE FUNCTION get_user_streak(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'current_streak', current_streak,
    'longest_streak', longest_streak,
    'last_login_date', last_login_date
  )
  INTO v_result
  FROM user_streaks
  WHERE user_id = p_user_id;

  IF v_result IS NULL THEN
    -- No streak data yet - return defaults
    RETURN json_build_object(
      'current_streak', 0,
      'longest_streak', 0,
      'last_login_date', null
    );
  END IF;

  RETURN v_result;
END;
$$;
