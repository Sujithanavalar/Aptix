GRANT EXECUTE ON FUNCTION initialize_user_topic_progress(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION update_level_progress(uuid, integer, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_topic_progress(uuid, integer) TO authenticated;

UPDATE user_level_progress ulp
SET
  highest_score = GREATEST(
    ulp.highest_score,
    COALESCE((
      SELECT MAX(ROUND((ta.score::numeric / NULLIF(ta.total_questions,0)) * 100))
      FROM test_attempts ta
      WHERE ta.user_id = ulp.user_id
        AND ta.topic_id = ulp.topic_id
        AND ta.difficulty::text = ulp.difficulty
        AND ta.is_practice = false
    ), 0)
  ),
  is_unlocked = CASE
    WHEN ulp.difficulty = 'easy' THEN true
    WHEN ulp.difficulty = 'medium' THEN COALESCE((
      SELECT MAX(ROUND((ta.score::numeric / NULLIF(ta.total_questions,0)) * 100))
      FROM test_attempts ta
      WHERE ta.user_id = ulp.user_id
        AND ta.topic_id = ulp.topic_id
        AND ta.difficulty::text = 'easy'
        AND ta.is_practice = false
    ),0) >= 80
    WHEN ulp.difficulty = 'hard' THEN COALESCE((
      SELECT MAX(ROUND((ta.score::numeric / NULLIF(ta.total_questions,0)) * 100))
      FROM test_attempts ta
      WHERE ta.user_id = ulp.user_id
        AND ta.topic_id = ulp.topic_id
        AND ta.difficulty::text = 'medium'
        AND ta.is_practice = false
    ),0) >= 80
    ELSE ulp.is_unlocked
  END,
  unlocked_at = CASE
    WHEN ulp.difficulty = 'medium' AND ulp.is_unlocked = false AND COALESCE((
      SELECT MAX(ROUND((ta.score::numeric / NULLIF(ta.total_questions,0)) * 100))
      FROM test_attempts ta
      WHERE ta.user_id = ulp.user_id
        AND ta.topic_id = ulp.topic_id
        AND ta.difficulty::text = 'easy'
        AND ta.is_practice = false
    ),0) >= 80 THEN NOW()
    WHEN ulp.difficulty = 'hard' AND ulp.is_unlocked = false AND COALESCE((
      SELECT MAX(ROUND((ta.score::numeric / NULLIF(ta.total_questions,0)) * 100))
      FROM test_attempts ta
      WHERE ta.user_id = ulp.user_id
        AND ta.topic_id = ulp.topic_id
        AND ta.difficulty::text = 'medium'
        AND ta.is_practice = false
    ),0) >= 80 THEN NOW()
    ELSE ulp.unlocked_at
  END,
  updated_at = NOW();
