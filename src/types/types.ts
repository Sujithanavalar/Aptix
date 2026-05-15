export type UserRole = 'user' | 'admin' | 'staff';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface AssignedSection {
  department: string;
  year: string;
  section: string;
}

export interface Profile {
  has_setup_password: boolean;
  id: string;
  username: string;
  email: string;
  role: UserRole;
  register_no?: string;
  staff_id?: string;
  department?: string;
  year?: string;
  section?: string;
  assigned_sections?: AssignedSection[];
  created_at: string;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
  definition: string;
  icon: string;
  video_url?: string;
  content: {
    introduction?: string;
    key_concepts?: string[];
    approaches: Array<{
      name: string;
      description: string;
      when_to_use?: string;
      steps?: string[];
      example?: {
        problem: string;
        solution_steps: string[];
        answer: string;
        verification?: string;
      };
      common_mistakes?: string[];
    }>;
    common_mistakes?: string[];
    key_formulas?: string[];
    practice_tips?: string[];
  };
  order_index: number;
  created_at: string;
}

export interface Question {
  id: number;
  topic_id: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  difficulty: DifficultyLevel;
  explanation: string;
  solution_steps: {
    steps: string[];
  } | null;
  created_at: string;
}

export interface TestAttempt {
  id: number;
  user_id: string;
  topic_id: number;
  difficulty: DifficultyLevel;
  question_count: number;
  timer_enabled: boolean;
  time_limit: number | null;
  time_taken: number | null;
  score: number;
  total_questions: number;
  answers: {
    question_id: number;
    selected_answer: number;
    is_correct: boolean;
  }[];
  completed_at: string;
  is_practice: boolean;
}

export interface UserProgress {
  id: number;
  user_id: string;
  total_questions_solved: number;
  questions_solved_today: number;
  last_activity_date: string;
  total_time_spent: number;
  total_correct_answers: number;
  updated_at: string;
}

export interface UserLevelProgress {
  id: string;
  user_id: string;
  topic_id: number;
  difficulty: DifficultyLevel;
  highest_score: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestConfig {
  topicId: number;
  difficulty: DifficultyLevel;
  questionCount: number;
  timerEnabled: boolean;
}

export interface ProgressStats {
  averageTime: number;
  questionsSolvedToday: number;
  averageScore: number;
  questionsSolvedThisWeek: number;
}

export interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  message: string | null;
  created_at: string;
}

export interface SharedReport {
  id: string;
  share_id: string;
  user_id: string;
  username: string;
  report_data: {
    stats: ProgressStats;
    weeklyData: Array<{
      date: string;
      score: number;
      time: number;
      questionsCount: number;
    }>;
    achievements: {
      bestScore: number;
      bestScoreDate: string;
      fastestTime: number;
      fastestTimeDate: string;
      totalQuestions: number;
      totalTests: number;
    };
  };
  created_at: string;
  expires_at: string | null;
  view_count: number;
}
