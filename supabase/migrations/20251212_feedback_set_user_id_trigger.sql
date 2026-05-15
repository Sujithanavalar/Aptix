-- Automatically set feedback.user_id to auth.uid() to satisfy RLS insert policy
CREATE OR REPLACE FUNCTION set_feedback_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_feedback_user_id ON feedback;

CREATE TRIGGER trg_set_feedback_user_id
BEFORE INSERT ON feedback
FOR EACH ROW
EXECUTE FUNCTION set_feedback_user_id();
