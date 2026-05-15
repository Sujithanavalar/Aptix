/*
# Create Initial Schema for Aptix

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `username` (text, unique, not null)
- `role` (user_role enum, default: 'user')
- `created_at` (timestamptz, default: now())

### topics
- `id` (serial, primary key)
- `name` (text, unique, not null)
- `slug` (text, unique, not null)
- `definition` (text, not null)
- `content` (jsonb, not null) - stores approaches and examples
- `icon` (text) - icon name for the topic
- `order_index` (integer, not null)
- `created_at` (timestamptz, default: now())

### questions
- `id` (serial, primary key)
- `topic_id` (integer, references topics)
- `question_text` (text, not null)
- `options` (jsonb, not null) - array of 4 options
- `correct_answer` (integer, not null) - index of correct option (0-3)
- `difficulty` (difficulty_level enum, not null)
- `explanation` (text, not null)
- `solution_steps` (jsonb) - detailed step-by-step solution
- `created_at` (timestamptz, default: now())

### test_attempts
- `id` (serial, primary key)
- `user_id` (uuid, references profiles)
- `topic_id` (integer, references topics)
- `difficulty` (difficulty_level enum, not null)
- `question_count` (integer, not null)
- `timer_enabled` (boolean, default: false)
- `time_limit` (integer) - in seconds
- `time_taken` (integer) - in seconds
- `score` (integer, not null)
- `total_questions` (integer, not null)
- `answers` (jsonb, not null) - stores user answers
- `completed_at` (timestamptz, default: now())
- `is_practice` (boolean, default: false)

### user_progress
- `id` (serial, primary key)
- `user_id` (uuid, references profiles, unique)
- `total_questions_solved` (integer, default: 0)
- `questions_solved_today` (integer, default: 0)
- `last_activity_date` (date, default: current_date)
- `total_time_spent` (integer, default: 0) - in seconds
- `total_correct_answers` (integer, default: 0)
- `updated_at` (timestamptz, default: now())

## 2. Security

- Enable RLS on all tables
- Public read access for topics and questions (no login required)
- Users can read/write their own test_attempts and user_progress
- Admins have full access to all data
- First registered user becomes admin automatically

## 3. Notes

- Using username + password authentication (simulated with @miaoda.com)
- Email verification is disabled
- Questions are public for all users to access
- Progress tracking requires authentication
*/

-- Create enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  definition text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  icon text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id serial PRIMARY KEY,
  topic_id integer REFERENCES topics(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  difficulty difficulty_level NOT NULL,
  explanation text NOT NULL,
  solution_steps jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create test_attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id integer REFERENCES topics(id) ON DELETE CASCADE,
  difficulty difficulty_level NOT NULL,
  question_count integer NOT NULL,
  timer_enabled boolean DEFAULT false,
  time_limit integer,
  time_taken integer,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  answers jsonb NOT NULL,
  completed_at timestamptz DEFAULT now(),
  is_practice boolean DEFAULT false
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id serial PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_questions_solved integer DEFAULT 0,
  questions_solved_today integer DEFAULT 0,
  last_activity_date date DEFAULT current_date,
  total_time_spent integer DEFAULT 0,
  total_correct_answers integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for topics (PUBLIC READ ACCESS)
CREATE POLICY "Anyone can view topics" ON topics
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage topics" ON topics
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for questions (PUBLIC READ ACCESS)
CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for test_attempts
CREATE POLICY "Users can view own test attempts" ON test_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test attempts" ON test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to test attempts" ON test_attempts
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full access to user progress" ON user_progress
  FOR ALL USING (is_admin(auth.uid()));

-- Function to automatically create user_progress when profile is created
CREATE OR REPLACE FUNCTION create_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_progress();

-- Function to make first user admin
CREATE OR REPLACE FUNCTION make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM profiles) = 1 THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_first_user_admin
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION make_first_user_admin();

