-- Reliable feedback submission using server-side auth.uid()
CREATE OR REPLACE FUNCTION submit_feedback(
  p_rating integer,
  p_message text
)
RETURNS feedback
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row feedback;
BEGIN
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Invalid rating. Must be 1..5';
  END IF;

  INSERT INTO feedback (user_id, rating, message)
  VALUES (auth.uid(), p_rating, p_message)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_feedback(integer, text) TO authenticated;
