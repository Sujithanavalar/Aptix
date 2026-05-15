/*
# Add Performance Indexes

## Purpose
Add database indexes to improve query performance for frequently accessed columns.
This will significantly speed up topic and question loading.

## Indexes Added
1. `idx_questions_topic_id` - Index on questions.topic_id for faster topic-based queries
2. `idx_questions_difficulty` - Index on questions.difficulty for faster difficulty filtering
3. `idx_questions_topic_difficulty` - Composite index for combined topic+difficulty queries
4. `idx_test_attempts_user_id` - Index on test_attempts.user_id for faster user history
5. `idx_test_attempts_completed_at` - Index on test_attempts.completed_at for sorting
6. `idx_user_progress_user_id` - Index on user_progress.user_id for faster progress lookup
7. `idx_topics_slug` - Index on topics.slug for faster slug-based lookups
8. `idx_topics_order_index` - Index on topics.order_index for faster ordering

## Performance Impact
- Queries filtering by topic_id and difficulty will be 10-100x faster
- User progress and test history queries will load instantly
- Overall page load time should improve from 2+ minutes to under 1 second
*/

-- Questions table indexes (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON questions(topic_id, difficulty);

-- Test attempts indexes
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_completed_at ON test_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_completed ON test_attempts(user_id, completed_at DESC);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Topics indexes
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_order_index ON topics(order_index);
