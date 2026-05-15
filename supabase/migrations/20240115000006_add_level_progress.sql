/*
# Add Level Progress Tracking

1. New Tables
  - `user_level_progress`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `topic_id` (integer, references topics)
    - `difficulty` (text, 'easy', 'medium', 'hard')
    - `highest_score` (integer, 0-100)
    - `is_unlocked` (boolean, default false)
    - `unlocked_at` (timestamptz, nullable)
    - `created_at` (timestamptz, default now())
    - `updated_at` (timestamptz, default now())

2. Indexes
  - Unique index on (user_id, topic_id, difficulty)
  - Index on user_id for faster lookups

3. Security
  - Enable RLS on `user_level_progress` table
  - Users can read their own progress
  - Users can insert/update their own progress
  - Admins have full access

4. Functions
  - Function to initialize user progress (Easy unlocked by default)
  - Function to check and unlock next level based on score
  - Function to get user's unlocked levels for a topic

5. Notes
  - Easy level is unlocked by default for all topics
  - Medium unlocks when Easy score ≥ 80%
  - Hard unlocks when Medium score ≥ 80%
  - Once unlocked, levels stay unlocked forever
*/

-- Create user_level_progress table
CREATE TABLE IF NOT EXISTS user_level_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id integer REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  highest_score integer DEFAULT 0 CHECK (highest_score >= 0 AND highest_score <= 100),
  is_unlocked boolean DEFAULT false NOT NULL,
  unlocked_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, topic_id, difficulty)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_level_progress_user_id ON user_level_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_level_progress_topic_id ON user_level_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_level_progress_user_topic ON user_level_progress(user_id, topic_id);

-- Enable RLS
ALTER TABLE user_level_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_level_progress' AND policyname = 'Users can view own level progress'
  ) THEN
    CREATE POLICY "Users can view own level progress" ON user_level_progress
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_level_progress' AND policyname = 'Users can insert own level progress'
  ) THEN
    CREATE POLICY "Users can insert own level progress" ON user_level_progress
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_level_progress' AND policyname = 'Users can update own level progress'
  ) THEN
    CREATE POLICY "Users can update own level progress" ON user_level_progress
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_level_progress' AND policyname = 'Admins have full access to level progress'
  ) THEN
    CREATE POLICY "Admins have full access to level progress" ON user_level_progress
      FOR ALL TO authenticated USING (is_admin(auth.uid()));
  END IF;
END
$$;

-- Function to initialize user progress for a topic (Easy unlocked by default)
CREATE OR REPLACE FUNCTION initialize_user_topic_progress(p_user_id uuid, p_topic_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert Easy level (unlocked by default)
  INSERT INTO user_level_progress (user_id, topic_id, difficulty, is_unlocked, unlocked_at)
  VALUES (p_user_id, p_topic_id, 'easy', true, now())
  ON CONFLICT (user_id, topic_id, difficulty) DO NOTHING;
  
  -- Insert Medium level (locked)
  INSERT INTO user_level_progress (user_id, topic_id, difficulty, is_unlocked)
  VALUES (p_user_id, p_topic_id, 'medium', false)
  ON CONFLICT (user_id, topic_id, difficulty) DO NOTHING;
  
  -- Insert Hard level (locked)
  INSERT INTO user_level_progress (user_id, topic_id, difficulty, is_unlocked)
  VALUES (p_user_id, p_topic_id, 'hard', false)
  ON CONFLICT (user_id, topic_id, difficulty) DO NOTHING;
END;
$$;

-- Function to update progress and unlock next level if score >= 80%
CREATE OR REPLACE FUNCTION update_level_progress(
  p_user_id uuid,
  p_topic_id integer,
  p_difficulty text,
  p_score integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_highest integer;
  v_next_difficulty text;
  v_unlocked_next boolean := false;
BEGIN
  PERFORM initialize_user_topic_progress(p_user_id, p_topic_id);

  -- Update current level progress
  INSERT INTO user_level_progress (user_id, topic_id, difficulty, highest_score, updated_at)
  VALUES (p_user_id, p_topic_id, p_difficulty, p_score, now())
  ON CONFLICT (user_id, topic_id, difficulty) 
  DO UPDATE SET 
    highest_score = GREATEST(user_level_progress.highest_score, p_score),
    updated_at = now();
  
  -- Get the updated highest score
  SELECT highest_score INTO v_current_highest
  FROM user_level_progress
  WHERE user_id = p_user_id 
    AND topic_id = p_topic_id 
    AND difficulty = p_difficulty;
  
  -- Check if next level should be unlocked (score >= 80%)
  IF v_current_highest >= 80 THEN
    -- Determine next difficulty level
    IF p_difficulty = 'easy' THEN
      v_next_difficulty := 'medium';
    ELSIF p_difficulty = 'medium' THEN
      v_next_difficulty := 'hard';
    ELSE
      v_next_difficulty := NULL;
    END IF;
    
    -- Unlock next level if it exists and isn't already unlocked
    IF v_next_difficulty IS NOT NULL THEN
      DECLARE
        v_prev_unlocked boolean;
      BEGIN
        SELECT is_unlocked INTO v_prev_unlocked
        FROM user_level_progress
        WHERE user_id = p_user_id
          AND topic_id = p_topic_id
          AND difficulty = v_next_difficulty;

        INSERT INTO user_level_progress (user_id, topic_id, difficulty, is_unlocked, unlocked_at, updated_at)
        VALUES (p_user_id, p_topic_id, v_next_difficulty, true, now(), now())
        ON CONFLICT (user_id, topic_id, difficulty)
        DO UPDATE SET 
          is_unlocked = true,
          unlocked_at = COALESCE(user_level_progress.unlocked_at, now()),
          updated_at = now();

        v_unlocked_next := NOT COALESCE(v_prev_unlocked, false);
      END;
    END IF;
  END IF;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'highest_score', v_current_highest,
    'unlocked_next_level', v_unlocked_next,
    'next_level', v_next_difficulty
  );
END;
$$;

-- Function to get user's progress for a topic
CREATE OR REPLACE FUNCTION get_user_topic_progress(p_user_id uuid, p_topic_id integer)
RETURNS TABLE (
  difficulty text,
  highest_score integer,
  is_unlocked boolean,
  unlocked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Initialize progress if it doesn't exist
  PERFORM initialize_user_topic_progress(p_user_id, p_topic_id);
  
  -- Return progress
  RETURN QUERY
  SELECT 
    ulp.difficulty,
    ulp.highest_score,
    ulp.is_unlocked,
    ulp.unlocked_at
  FROM user_level_progress ulp
  WHERE ulp.user_id = p_user_id 
    AND ulp.topic_id = p_topic_id
  ORDER BY 
    CASE ulp.difficulty
      WHEN 'easy' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'hard' THEN 3
    END;
END;
$$;
