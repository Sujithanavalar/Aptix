-- Ensure highest_score and unlocks update automatically when a test attempt is inserted
CREATE OR REPLACE FUNCTION sync_level_progress_after_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_practice THEN
    RETURN NEW;
  END IF;

  PERFORM initialize_user_topic_progress(NEW.user_id, NEW.topic_id);

  PERFORM update_level_progress(
    NEW.user_id,
    NEW.topic_id,
    NEW.difficulty::text,
    COALESCE(ROUND((NEW.score::numeric / NULLIF(NEW.total_questions,0)) * 100), 0)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_level_progress_after_attempt ON test_attempts;

CREATE TRIGGER trg_sync_level_progress_after_attempt
AFTER INSERT ON test_attempts
FOR EACH ROW
EXECUTE FUNCTION sync_level_progress_after_attempt();
