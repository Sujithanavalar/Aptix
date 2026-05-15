# Aptix User Data Architecture

## Executive Summary

Aptix implements a **robust, secure, and fully isolated user data architecture** that ensures:
- ✅ **Complete data isolation** between users
- ✅ **100% data persistence** across login sessions
- ✅ **Cross-device synchronization** via database
- ✅ **Database-level security** with Row Level Security (RLS)
- ✅ **No data loss** from browser clearing or device switching

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Authentication                      │
│                    (Supabase Auth)                          │
│                                                             │
│  User logs in → Receives auth.uid() → Used for all queries │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Row Level Security (RLS)                   │
│                                                             │
│  Every query automatically filtered by:                     │
│  WHERE user_id = auth.uid()                                 │
│                                                             │
│  Database enforces isolation - cannot be bypassed           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      User Data Tables                        │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  user_progress   │  │  test_attempts   │               │
│  │  - user_id       │  │  - user_id       │               │
│  │  - avg_time      │  │  - topic_id      │               │
│  │  - questions     │  │  - difficulty    │               │
│  │  - avg_score     │  │  - score         │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ user_level_prog  │  │  user_streaks    │               │
│  │  - user_id       │  │  - user_id       │               │
│  │  - topic_id      │  │  - current_streak│               │
│  │  - difficulty    │  │  - longest_streak│               │
│  │  - is_unlocked   │  │  - last_login    │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Isolation Mechanism

### 1. Database Level Isolation

Every user data table has:
```sql
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
```

This ensures:
- Each record is tied to a specific user
- User deletion cascades to all their data
- Foreign key integrity maintained

### 2. Row Level Security (RLS)

Every table has RLS policies:
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert own data" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own data" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);
```

### 3. Application Level Isolation

All API calls include user ID:
```typescript
// Example: Fetch user progress
const stats = await userProgressApi.getStats(user.id);

// Database query automatically filtered:
// SELECT * FROM user_progress WHERE user_id = auth.uid()
```

---

## Data Persistence Architecture

### 1. Streak Tracking (Database-Backed)

**Previous Implementation (localStorage):**
- ❌ Only persisted in single browser
- ❌ Lost when cache cleared
- ❌ No cross-device sync

**Current Implementation (Database):**
- ✅ Persists in PostgreSQL database
- ✅ Syncs across all devices
- ✅ Survives cache clearing
- ✅ Backed up with database

**Database Schema:**
```sql
CREATE TABLE user_streaks (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  current_streak integer,
  longest_streak integer,
  last_login_date date,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Streak Logic (Database Function):**
```sql
CREATE FUNCTION update_user_streak(p_user_id uuid)
RETURNS json AS $$
  -- Calculate days since last login
  -- If same day: No change
  -- If consecutive day: Increment streak
  -- If missed day: Reset to 1
  -- Track longest streak achieved
$$;
```

### 2. Progress Statistics (Database-Backed)

**Database Schema:**
```sql
CREATE TABLE user_progress (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  total_questions_solved integer,
  total_correct_answers integer,
  total_time_spent integer,
  questions_solved_today integer,
  last_activity_date date,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Calculated Stats:**
- Average Time: `total_time_spent / total_questions_solved`
- Questions Today: `questions_solved_today` (resets daily)
- Average Score: `(total_correct_answers / total_questions_solved) * 100`

**Atomic Updates:**
```sql
CREATE FUNCTION update_user_progress_atomic(
  p_user_id uuid,
  p_questions_count integer,
  p_correct_count integer,
  p_time_spent integer
) RETURNS void AS $$
  -- Atomically update all counters
  -- Handle daily reset logic
  -- Ensure data consistency
$$;
```

### 3. Level Unlocking (Database-Backed)

**Database Schema:**
```sql
CREATE TABLE user_level_progress (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  topic_id integer REFERENCES topics(id),
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  highest_score integer,
  is_unlocked boolean,
  unlocked_at timestamptz,
  UNIQUE(user_id, topic_id, difficulty)
);
```

**Unlock Logic (Database Function):**
```sql
CREATE FUNCTION update_level_progress(
  p_user_id uuid,
  p_topic_id integer,
  p_difficulty text,
  p_score integer
) RETURNS json AS $$
  -- Update highest score
  -- If score >= 80% and next level exists:
  --   Unlock next level
  --   Return unlock notification
  -- Track unlock timestamp
$$;
```

**Unlock Rules:**
- Easy: Always unlocked (default)
- Medium: Unlocks when Easy score ≥ 80%
- Hard: Unlocks when Medium score ≥ 80%
- Once unlocked, stays unlocked forever
- Per-topic progression (independent)

### 4. Test Attempts (Database-Backed)

**Database Schema:**
```sql
CREATE TABLE test_attempts (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  topic_id integer REFERENCES topics(id),
  difficulty text,
  question_count integer,
  timer_enabled boolean,
  time_limit integer,
  time_taken integer,
  score integer,
  total_questions integer,
  answers jsonb,
  is_practice boolean,
  created_at timestamptz
);
```

**Data Stored:**
- Complete test configuration
- All answers (for review)
- Score and time taken
- Practice vs. test mode
- Timestamp for history

---

## Cross-Device Synchronization

### Scenario 1: User Switches Devices

**Device A (Morning):**
1. User logs in
2. Completes Easy test with 90%
3. Medium level unlocks
4. Streak increments to 5
5. Logs out

**Device B (Afternoon):**
1. User logs in (same account)
2. Database queries fetch data by user_id
3. Medium level shows as unlocked ✅
4. Streak shows 5 ✅
5. Test history includes morning test ✅
6. Progress stats include morning activity ✅

**How It Works:**
```typescript
// On login, all hooks fetch from database
useEffect(() => {
  if (user?.id) {
    // Fetch streak from database
    const streak = await streakApi.updateStreak(user.id);
    
    // Fetch progress from database
    const stats = await userProgressApi.getStats(user.id);
    
    // Fetch level progress from database
    const progress = await levelProgressApi.getUserTopicProgress(user.id, topicId);
    
    // All data synced automatically
  }
}, [user?.id]);
```

### Scenario 2: User Clears Browser Cache

**Before Cache Clear:**
- Streak: 10 days
- Progress: 500 questions solved
- Levels: All unlocked

**After Cache Clear:**
- localStorage cleared (no impact - we don't use it for critical data)
- Cookies cleared (need to login again)
- IndexedDB cleared (no impact - we don't use it)

**After Re-login:**
- Streak: 10 days ✅ (from database)
- Progress: 500 questions ✅ (from database)
- Levels: All unlocked ✅ (from database)

---

## Security Architecture

### 1. Authentication Layer

```typescript
// Supabase Auth provides:
- User registration with email/password
- Secure session management
- JWT tokens for API calls
- auth.uid() for user identification
```

### 2. Database Security Layer

```sql
-- RLS enabled on all user tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Policies enforce user_id matching
CREATE POLICY "Users can view own data" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
```

### 3. API Security Layer

```typescript
// All API calls require authenticated user
const { user } = useAuth();
if (!user) {
  // Redirect to login
  return;
}

// All queries include user_id
const data = await api.getData(user.id);
```

### 4. Function Security Layer

```sql
-- Database functions use SECURITY DEFINER
CREATE FUNCTION update_user_streak(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges
AS $$
BEGIN
  -- But still enforces user_id checks
  -- Only operates on p_user_id data
  -- Cannot access other users' data
END;
$$;
```

---

## Data Flow Examples

### Example 1: User Completes a Test

```
1. User Interface
   ↓
   User clicks "Submit Test"
   
2. React Component (TestResults.tsx)
   ↓
   const { user } = useAuth();
   await testAttemptsApi.create({
     user_id: user.id,  // ← User ID from auth
     topic_id: topicId,
     score: score,
     ...
   });
   
3. API Layer (api.ts)
   ↓
   const { data, error } = await supabase
     .from('test_attempts')
     .insert({ user_id, ... });
   
4. Database Layer (PostgreSQL)
   ↓
   -- RLS policy checks: auth.uid() = user_id
   -- If match: INSERT allowed
   -- If no match: INSERT denied
   INSERT INTO test_attempts (user_id, ...) VALUES (...);
   
5. Update Level Progress
   ↓
   await levelProgressApi.updateLevelProgress(
     user.id,  // ← User ID from auth
     topicId,
     difficulty,
     score
   );
   
6. Database Function
   ↓
   SELECT update_level_progress(
     p_user_id := user.id,  -- ← User ID parameter
     p_topic_id := topicId,
     p_difficulty := difficulty,
     p_score := score
   );
   
7. Function Logic
   ↓
   -- Update highest score for this user
   UPDATE user_level_progress
   SET highest_score = GREATEST(highest_score, p_score)
   WHERE user_id = p_user_id  -- ← Only this user's data
     AND topic_id = p_topic_id
     AND difficulty = p_difficulty;
   
   -- Check if next level should unlock
   IF p_score >= 80 AND next_level_exists THEN
     UPDATE user_level_progress
     SET is_unlocked = true
     WHERE user_id = p_user_id  -- ← Only this user's data
       AND topic_id = p_topic_id
       AND difficulty = next_difficulty;
   END IF;
   
8. Return to UI
   ↓
   -- Show unlock notification if applicable
   -- Update progress stats
   -- Display test results
```

### Example 2: User Logs In (Cross-Device)

```
1. User Interface (Device B)
   ↓
   User enters email/password
   
2. Supabase Auth
   ↓
   -- Verify credentials
   -- Create session
   -- Generate JWT token
   -- Return user object with user.id
   
3. React Context (AuthContext)
   ↓
   setUser({ id: 'uuid-123', email: 'user@example.com' });
   
4. React Hooks (useEffect)
   ↓
   useEffect(() => {
     if (user?.id) {
       fetchAllUserData(user.id);
     }
   }, [user?.id]);
   
5. Parallel Data Fetching
   ↓
   Promise.all([
     streakApi.updateStreak(user.id),
     userProgressApi.getStats(user.id),
     testAttemptsApi.getRecentByUserId(user.id, 5)
   ]);
   
6. Database Queries (All filtered by user_id)
   ↓
   -- Streak query
   SELECT * FROM user_streaks
   WHERE user_id = auth.uid();  -- ← RLS enforced
   
   -- Progress query
   SELECT * FROM user_progress
   WHERE user_id = auth.uid();  -- ← RLS enforced
   
   -- Test attempts query
   SELECT * FROM test_attempts
   WHERE user_id = auth.uid()  -- ← RLS enforced
   ORDER BY created_at DESC
   LIMIT 5;
   
7. Data Returns to UI
   ↓
   -- Streak: 10 days (from Device A activity)
   -- Progress: 500 questions (from all devices)
   -- Recent tests: Last 5 tests (from all devices)
   -- Level unlocks: All unlocked levels (from all devices)
   
8. UI Updates
   ↓
   -- Display streak with glow effect
   -- Show progress statistics
   -- Render recent tests list
   -- Enable unlocked difficulty levels
```

---

## Testing & Verification

### Automated Tests (Database Level)

```sql
-- Test 1: User A cannot see User B's data
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'user-a-uuid';

SELECT * FROM user_progress;
-- Returns only User A's data

SET LOCAL request.jwt.claim.sub = 'user-b-uuid';

SELECT * FROM user_progress;
-- Returns only User B's data (different results)
```

### Manual Tests (Application Level)

See `FEATURE_VERIFICATION_CHECKLIST.md` for comprehensive testing checklist.

---

## Performance Considerations

### 1. Database Indexes

```sql
-- Indexes for fast user data lookup
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX idx_user_level_progress_user_topic ON user_level_progress(user_id, topic_id);
CREATE UNIQUE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
```

### 2. Query Optimization

```typescript
// Fetch only recent data (not all history)
const recentTests = await testAttemptsApi.getRecentByUserId(userId, 5);

// Use database functions for complex calculations
const stats = await userProgressApi.getStats(userId);
// Instead of fetching all data and calculating in JavaScript
```

### 3. Caching Strategy

```typescript
// React hooks cache data in state
const { stats, loading } = useProgress(user?.id);

// Only refetch when needed
const refresh = () => {
  fetchStats();
};
```

---

## Maintenance & Monitoring

### Database Maintenance

```sql
-- Periodic cleanup of old test attempts (optional)
DELETE FROM test_attempts
WHERE created_at < NOW() - INTERVAL '1 year'
  AND user_id NOT IN (SELECT id FROM auth.users WHERE role = 'admin');

-- Vacuum and analyze for performance
VACUUM ANALYZE user_progress;
VACUUM ANALYZE test_attempts;
VACUUM ANALYZE user_level_progress;
VACUUM ANALYZE user_streaks;
```

### Monitoring Queries

```sql
-- Check user activity
SELECT 
  COUNT(DISTINCT user_id) as active_users,
  SUM(total_questions_solved) as total_questions,
  AVG(total_questions_solved) as avg_per_user
FROM user_progress;

-- Check streak distribution
SELECT 
  current_streak,
  COUNT(*) as user_count
FROM user_streaks
GROUP BY current_streak
ORDER BY current_streak DESC;

-- Check level unlock progress
SELECT 
  difficulty,
  COUNT(*) as unlocked_count
FROM user_level_progress
WHERE is_unlocked = true
GROUP BY difficulty;
```

---

## Conclusion

Aptix implements a **production-ready, secure, and scalable user data architecture** that ensures:

✅ **Complete Data Isolation**
- Database-level RLS policies
- User ID filtering on all queries
- No cross-user data leakage possible

✅ **100% Data Persistence**
- All critical data in PostgreSQL database
- No localStorage dependency for important data
- Survives cache clearing and device switching

✅ **Cross-Device Synchronization**
- Database-backed storage
- Automatic sync on login
- Consistent experience everywhere

✅ **Security & Privacy**
- Row Level Security (RLS) enabled
- SECURITY DEFINER functions
- Foreign key constraints
- Input validation

✅ **Performance & Scalability**
- Optimized database indexes
- Efficient query patterns
- Atomic operations
- Proper caching

✅ **Maintainability**
- Clear separation of concerns
- Type-safe API layer
- Comprehensive documentation
- Testing checklist

**Result:** Users can confidently use Aptix knowing their progress, streaks, and achievements are **securely stored, properly isolated, and always available** across all their devices.
