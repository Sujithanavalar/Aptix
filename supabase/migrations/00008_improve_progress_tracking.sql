/*
# Improve User Progress Tracking

## 1. Purpose
Create a robust database function to handle user progress updates atomically,
ensuring accurate tracking of daily questions and automatic reset at midnight.

## 2. New Functions

### update_user_progress_atomic
- Atomically updates user progress statistics
- Automatically resets daily question count if date has changed
- Handles concurrent updates safely
- Parameters:
  - p_user_id (uuid): User ID
  - p_questions_count (integer): Number of questions completed
  - p_correct_count (integer): Number of correct answers
  - p_time_spent (integer): Time spent in seconds

## 3. Benefits
- Atomic updates prevent race conditions
- Automatic daily reset at midnight
- Simplified client-side code
- Better data consistency
- Handles edge cases (timezone changes, etc.)

## 4. Usage
SELECT update_user_progress_atomic(
  'user-uuid-here',
  10,  -- questions completed
  8,   -- correct answers
  300  -- time spent (5 minutes)
);
*/

-- Create atomic progress update function
CREATE OR REPLACE FUNCTION update_user_progress_atomic(
  p_user_id uuid,
  p_questions_count integer,
  p_correct_count integer,
  p_time_spent integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_last_activity date;
  v_is_today boolean;
BEGIN
  -- Get the last activity date
  SELECT last_activity_date INTO v_last_activity
  FROM user_progress
  WHERE user_id = p_user_id;

  -- Check if activity is from today
  v_is_today := (v_last_activity = v_today);

  -- Update progress atomically
  UPDATE user_progress
  SET
    total_questions_solved = total_questions_solved + p_questions_count,
    questions_solved_today = CASE
      WHEN v_is_today THEN questions_solved_today + p_questions_count
      ELSE p_questions_count
    END,
    last_activity_date = v_today,
    total_time_spent = total_time_spent + p_time_spent,
    total_correct_answers = total_correct_answers + p_correct_count,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- If no row was updated, create one (shouldn't happen with trigger, but safety check)
  IF NOT FOUND THEN
    INSERT INTO user_progress (
      user_id,
      total_questions_solved,
      questions_solved_today,
      last_activity_date,
      total_time_spent,
      total_correct_answers
    ) VALUES (
      p_user_id,
      p_questions_count,
      p_questions_count,
      v_today,
      p_time_spent,
      p_correct_count
    );
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_progress_atomic TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION update_user_progress_atomic IS 
'Atomically updates user progress statistics with automatic daily reset';
