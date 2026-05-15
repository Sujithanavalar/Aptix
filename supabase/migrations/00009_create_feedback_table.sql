/*
# Create feedback table

## Purpose
Store user feedback and ratings for the Aptix application.

## Tables Created

### `feedback`
- `id` (uuid, primary key) - Unique identifier for each feedback entry
- `user_id` (uuid, references auth.users) - User who submitted the feedback
- `rating` (integer, 1-5) - Star rating given by the user
- `message` (text, optional) - Detailed feedback message
- `created_at` (timestamptz) - Timestamp when feedback was submitted

## Security
- Enable RLS on feedback table
- Users can insert their own feedback
- Admins can view all feedback
- Users cannot view other users' feedback (privacy)

## Notes
- Rating is required (1-5 stars)
- Message is optional
- Feedback is timestamped for tracking
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'Users can insert own feedback'
  ) THEN
    CREATE POLICY "Users can insert own feedback" ON feedback
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'Admins can view all feedback'
  ) THEN
    CREATE POLICY "Admins can view all feedback" ON feedback
      FOR SELECT TO authenticated
      USING (is_admin(auth.uid()));
  END IF;
END
$$;
 
-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
