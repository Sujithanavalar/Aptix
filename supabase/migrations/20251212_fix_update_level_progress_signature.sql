/*
Adjust update_level_progress to accept numeric p_score to avoid type resolution errors
like "function update_level_progress(uuid, integer, text, numeric) does not exist".
*/
CREATE OR REPLACE FUNCTION update_level_progress(
  p_user_id uuid,
  p_topic_id integer,
  p_difficulty text,
  p_score numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_highest integer;
  v_next_difficulty text;
  v_unlocked_next boolean := false;
  v_score_int integer := GREATEST(0, LEAST(100, ROUND(p_score)::int));
BEGIN
  PERFORM initialize_user_topic_progress(p_user_id, p_topic_id);

  INSERT INTO user_level_progress (user_id, topic_id, difficulty, highest_score, updated_at)
  VALUES (p_user_id, p_topic_id, p_difficulty, v_score_int, now())
  ON CONFLICT (user_id, topic_id, difficulty) 
  DO UPDATE SET 
    highest_score = GREATEST(user_level_progress.highest_score, v_score_int),
    updated_at = now();
  
  SELECT highest_score INTO v_current_highest
  FROM user_level_progress
  WHERE user_id = p_user_id 
    AND topic_id = p_topic_id 
    AND difficulty = p_difficulty;
  
  IF v_current_highest >= 80 THEN
    IF p_difficulty = 'easy' THEN
      v_next_difficulty := 'medium';
    ELSIF p_difficulty = 'medium' THEN
      v_next_difficulty := 'hard';
    ELSE
      v_next_difficulty := NULL;
    END IF;
    
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
  
  RETURN json_build_object(
    'success', true,
    'highest_score', v_current_highest,
    'unlocked_next_level', v_unlocked_next,
    'next_level', v_next_difficulty
  );
END;
$$;

GRANT EXECUTE ON FUNCTION update_level_progress(uuid, integer, text, numeric) TO authenticated;
