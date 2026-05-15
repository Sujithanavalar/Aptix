import { supabase } from './supabase';
import type { Topic, Question, TestAttempt, UserProgress, DifficultyLevel, ProgressStats, Feedback, SharedReport } from '@/types/types';

// Timeout wrapper for database queries
const QUERY_TIMEOUT = 10000; // 10 seconds

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = QUERY_TIMEOUT): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout - database may be slow or unavailable')), timeoutMs)
    )
  ]);
}

// Simple in-memory cache for topics (they rarely change)
let topicsCache: Topic[] | null = null;
let topicsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const topicsApi = {
  async getAll(): Promise<Topic[]> {
    const now = Date.now();
    // SILENT CACHING: Removed the log here to prevent console spam
    if (topicsCache && (now - topicsCacheTime) < CACHE_DURATION) {
      return topicsCache;
    }

    // Only log when a real network request starts
    console.log('⏳ Syncing topics from database...');
    const startTime = Date.now();
    
    try {
      const { data, error } = await withTimeout(
        (async () => {
          return await supabase
            .from('topics')
            .select('*')
            .order('order_index', { ascending: true });
        })()
      );
      
      const elapsed = Date.now() - startTime;
      console.log(`✅ Topics synced in ${elapsed}ms`);
      
      if (error) throw error;
      const topics = Array.isArray(data) ? data : [];
      
      // Update cache
      topicsCache = topics;
      topicsCacheTime = now;
      
      return topics;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`❌ Topics failed to load after ${elapsed}ms:`, error);
      throw error;
    }
  },

  async getBySlug(slug: string): Promise<Topic | null> {
    const { data, error } = await withTimeout(
      (async () => {
        return await supabase
          .from('topics')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
      })()
    );
    
    if (error) throw error;
    return data;
  },

  async getById(id: number): Promise<Topic | null> {
    if (topicsCache) {
      const cached = topicsCache.find(t => t.id === id);
      if (cached) return cached;
    }

    const { data, error } = await withTimeout(
      (async () => {
        return await supabase
          .from('topics')
          .select('*')
          .eq('id', id)
          .maybeSingle();
      })()
    );
    
    if (error) throw error;
    return data;
  },

  clearCache() {
    topicsCache = null;
    topicsCacheTime = 0;
  }
};

export const questionsApi = {
  async getByTopic(topicId: number, difficulty: DifficultyLevel, limit: number): Promise<Question[]> {
    const { data, error } = await withTimeout(
      (async () => {
        return await supabase
          .from('questions')
          .select('*')
          .eq('topic_id', topicId)
          .eq('difficulty', difficulty)
          .order('id', { ascending: true })
          .limit(limit);
      })()
    );
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getRandomByTopic(topicId: number, difficulty: DifficultyLevel, count: number): Promise<Question[]> {
    const { data, error } = await withTimeout(
      (async () => {
        return await supabase
          .from('questions')
          .select('*')
          .eq('topic_id', topicId)
          .eq('difficulty', difficulty);
      })()
    );
    
    if (error) throw error;
    
    const questions = Array.isArray(data) ? data : [];
    const shuffled = questions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  async getByIds(ids: number[]): Promise<Question[]> {
    if (!ids || ids.length === 0) return [];
    const { data, error } = await withTimeout(
      (async () => {
        return await supabase
          .from('questions')
          .select('*')
          .in('id', ids);
      })()
    );
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

export const testAttemptsApi = {
  async create(attempt: Omit<TestAttempt, 'id' | 'completed_at'>): Promise<TestAttempt | null> {
    const { data, error } = await supabase
      .from('test_attempts')
      .insert(attempt)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getUserAttempts(userId: string, limit = 10): Promise<TestAttempt[]> {
    const { data, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getRecentAttempts(userId: string, days = 30): Promise<TestAttempt[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const { data, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', date.toISOString())
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

export const userProgressApi = {
  async get(userId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async update(userId: string, updates: Partial<UserProgress>): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async incrementProgress(
    userId: string,
    questionsCount: number,
    correctCount: number,
    timeSpent: number
  ): Promise<void> {
    const { error } = await supabase.rpc('update_user_progress_atomic', {
      p_user_id: userId,
      p_questions_count: questionsCount,
      p_correct_count: correctCount,
      p_time_spent: timeSpent
    });

    if (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  async getWeeklySolvedCount(userId: string): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    const { data, error } = await supabase
      .from('test_attempts')
      .select('score')
      .eq('user_id', userId)
      .gte('completed_at', date.toISOString());

    if (error) {
      console.error('Error fetching weekly solved count:', error);
      throw error;
    }

    return (data || []).reduce((acc, attempt) => acc + (attempt.score || 0), 0);
  },

  async getStats(userId: string): Promise<ProgressStats> {
    const [progress, weeklySolvedCount] = await Promise.all([
        this.get(userId),
        this.getWeeklySolvedCount(userId)
    ]);
    
    if (!progress || progress.total_questions_solved === 0) {
      return {
        averageTime: 0,
        questionsSolvedToday: 0,
        averageScore: 0,
        questionsSolvedThisWeek: 0
      };
    }

    const averageTime = Math.round(progress.total_time_spent / progress.total_questions_solved);
    const averageScore = Math.round((progress.total_correct_answers / progress.total_questions_solved) * 100);

    return {
      averageTime,
      questionsSolvedToday: progress.questions_solved_today,
      averageScore,
      questionsSolvedThisWeek: weeklySolvedCount
    };
  }
};

export const profilesApi = {
  async getCurrent(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

export const feedbackApi = {
  async create(_userId: string, rating: number, message: string | null): Promise<Feedback> {
    const { data, error } = await supabase.rpc('submit_feedback', {
      p_rating: rating,
      p_message: message
    });
    
    if (error) throw error;
    return data;
  },

  async getAll(): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

export const sharedReportsApi = {
  async create(userId: string, username: string, reportData: any): Promise<SharedReport> {
    const shareId = Math.random().toString(36).substring(2, 10);
    
    const { data, error } = await supabase
      .from('shared_reports')
      .insert({
        share_id: shareId,
        user_id: userId,
        username,
        report_data: reportData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByShareId(shareId: string): Promise<SharedReport | null> {
    const { data, error } = await supabase
      .from('shared_reports')
      .select('*')
      .eq('share_id', shareId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      await supabase.rpc('increment_report_view_count', { report_share_id: shareId });
    }
    
    return data;
  },

  async getUserReports(userId: string): Promise<SharedReport[]> {
    const { data, error } = await supabase
      .from('shared_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async delete(shareId: string): Promise<void> {
    const { error } = await supabase
      .from('shared_reports')
      .delete()
      .eq('share_id', shareId);
    
    if (error) throw error;
  }
};

export const levelProgressApi = {
  // Existing logic remains intact to ensure no breaking changes
  async backfillFromAttempts(userId: string, topicId: number): Promise<void> {
    await topicsApi.getById(topicId);
    await this.initializeTopicProgress(userId, topicId);
    const { data: attempts } = await supabase
      .from('test_attempts')
      .select('difficulty,score,total_questions')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .eq('is_practice', false);
    const list = Array.isArray(attempts) ? attempts : [];
    let easyMax = 0;
    let mediumMax = 0;
    let hardMax = 0;
    for (const a of list) {
      const total = a.total_questions || 0;
      const score = a.score || 0;
      if (total <= 0) continue;
      const pct = Math.round((score / total) * 100);
      if (a.difficulty === 'easy') easyMax = Math.max(easyMax, pct);
      else if (a.difficulty === 'medium') mediumMax = Math.max(mediumMax, pct);
      else if (a.difficulty === 'hard') hardMax = Math.max(hardMax, pct);
    }
    const { data: current } = await supabase
      .from('user_level_progress')
      .select('difficulty,highest_score,is_unlocked,unlocked_at')
      .eq('user_id', userId)
      .eq('topic_id', topicId);
    const map: Record<string, { highest_score: number; is_unlocked: boolean; unlocked_at: string | null }> = {
      easy: { highest_score: 0, is_unlocked: true, unlocked_at: null },
      medium: { highest_score: 0, is_unlocked: false, unlocked_at: null },
      hard: { highest_score: 0, is_unlocked: false, unlocked_at: null }
    };
    (Array.isArray(current) ? current : []).forEach((row: any) => {
      map[row.difficulty] = {
        highest_score: row.highest_score ?? 0,
        is_unlocked: !!row.is_unlocked,
        unlocked_at: row.unlocked_at ?? null
      };
    });
    const easyHighest = Math.max(map.easy.highest_score, easyMax);
    const mediumHighest = Math.max(map.medium.highest_score, mediumMax);
    const hardHighest = Math.max(map.hard.highest_score, hardMax);
    const now = new Date().toISOString();
    const mediumUnlocked = map.medium.is_unlocked || easyHighest >= 80;
    const hardUnlocked = map.hard.is_unlocked || mediumHighest >= 80;
    const mediumUnlockedAt = mediumUnlocked ? map.medium.unlocked_at ?? now : map.medium.unlocked_at;
    const hardUnlockedAt = hardUnlocked ? map.hard.unlocked_at ?? now : map.hard.unlocked_at;
    
    await supabase.from('user_level_progress').upsert([
        { user_id: userId, topic_id: topicId, difficulty: 'easy', highest_score: easyHighest, is_unlocked: true, unlocked_at: map.easy.unlocked_at, updated_at: now },
        { user_id: userId, topic_id: topicId, difficulty: 'medium', highest_score: mediumHighest, is_unlocked: mediumUnlocked, unlocked_at: mediumUnlockedAt, updated_at: now },
        { user_id: userId, topic_id: topicId, difficulty: 'hard', highest_score: hardHighest, is_unlocked: hardUnlocked, unlocked_at: hardUnlockedAt, updated_at: now }
      ], { onConflict: 'user_id,topic_id,difficulty' });
  },

  async getUserTopicProgress(userId: string, topicId: number): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_topic_progress', { p_user_id: userId, p_topic_id: topicId });
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      if (!(rows.length > 0 && rows.every((r: any) => (r.highest_score ?? 0) === 0))) return rows;
    } catch (_) {}
    
    // Manual fallback fetch
    const { data: attempts } = await supabase
      .from('test_attempts')
      .select('difficulty,score,total_questions')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .eq('is_practice', false);
    
    const list = Array.isArray(attempts) ? attempts : [];
    let easyMax = 0, mediumMax = 0, hardMax = 0;
    for (const a of list) {
      const pct = Math.round(((a.score || 0) / (a.total_questions || 1)) * 100);
      if (a.difficulty === 'easy') easyMax = Math.max(easyMax, pct);
      else if (a.difficulty === 'medium') mediumMax = Math.max(mediumMax, pct);
      else if (a.difficulty === 'hard') hardMax = Math.max(hardMax, pct);
    }
    return [
      { difficulty: 'easy', highest_score: easyMax, is_unlocked: true, unlocked_at: null },
      { difficulty: 'medium', highest_score: mediumMax, is_unlocked: easyMax >= 80, unlocked_at: null },
      { difficulty: 'hard', highest_score: hardMax, is_unlocked: mediumMax >= 80, unlocked_at: null },
    ];
  },

  async updateLevelProgress(userId: string, topicId: number, difficulty: DifficultyLevel, score: number): Promise<any> {
    try {
      const { data } = await supabase.rpc('update_level_progress', { p_user_id: userId, p_topic_id: topicId, p_difficulty: difficulty, p_score: score });
      if (data) return data;
    } catch (_) {}

    // Persistence Fallback
    await this.initializeTopicProgress(userId, topicId);
    const { data: current } = await supabase.from('user_level_progress').select('highest_score').eq('user_id', userId).eq('topic_id', topicId).eq('difficulty', difficulty).maybeSingle();
    const newHighest = Math.max(current?.highest_score ?? 0, score);
    
    await supabase.from('user_level_progress').upsert({
      user_id: userId, topic_id: topicId, difficulty, highest_score: newHighest, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,topic_id,difficulty' });

    return { success: true, highest_score: newHighest };
  },

  async initializeTopicProgress(userId: string, topicId: number): Promise<void> {
    try {
      await supabase.rpc('initialize_user_topic_progress', { p_user_id: userId, p_topic_id: topicId });
    } catch (_) {
      // Manual creation of progress rows if RPC fails
      const now = new Date().toISOString();
      await supabase.from('user_level_progress').upsert([
        { user_id: userId, topic_id: topicId, difficulty: 'easy', is_unlocked: true, unlocked_at: now, updated_at: now },
        { user_id: userId, topic_id: topicId, difficulty: 'medium', is_unlocked: false, updated_at: now },
        { user_id: userId, topic_id: topicId, difficulty: 'hard', is_unlocked: false, updated_at: now }
      ], { onConflict: 'user_id,topic_id,difficulty' });
    }
  }
};

let streakRpcAvailable = true;
export const streakApi = {
  async updateStreak(userId: string): Promise<any> {
    if (!streakRpcAvailable) return { current_streak: 0 };
    const { data, error } = await supabase.rpc('update_user_streak', { p_user_id: userId });
    if (error && (error as any).code === 'PGRST202') {
      streakRpcAvailable = false;
      return { current_streak: 0 };
    }
    return data;
  },
  async getAllUserAttempts(userId: string): Promise<TestAttempt[]> {
    const { data, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getStreak(userId: string): Promise<any> {
    if (!streakRpcAvailable) return { current_streak: 0 };
    const { data, error } = await supabase.rpc('get_user_streak', { p_user_id: userId });
    if (error && (error as any).code === 'PGRST202') {
      streakRpcAvailable = false;
      return { current_streak: 0 };
    }
    return data;
  },
};
  // --- PASTE THIS AT THE VERY END OF src/db/api.ts ---

// APPEND THIS TO: src/db/api.ts

export const authApi = {
  // 1. Change password for currently logged-in user
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  },

  // 2. Sign out the user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 3. Send the "Forgot Password" email
  async sendPasswordResetEmail(email: string) {
    // This points to the page where they will type the new password
    // Make sure this route exists in your app (Step 4 below)
    const redirectTo = `${window.location.origin}/update-password`;
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });
    
    if (error) throw error;
    return data;
  }
};
