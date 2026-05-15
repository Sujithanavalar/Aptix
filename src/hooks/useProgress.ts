import { useState, useEffect } from 'react';
import { userProgressApi } from '@/db/api';
import type { ProgressStats } from '@/types/types';

export function useProgress(userId: string | undefined) {
  const [stats, setStats] = useState<ProgressStats>({
    averageTime: 0,
    questionsSolvedToday: 0,
    averageScore: 0,
    questionsSolvedThisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    if (!userId) return;
    
    try {
      const data = await userProgressApi.getStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (
    questionsCount: number,
    correctCount: number,
    timeSpent: number
  ) => {
    if (!userId) return;

    try {
      await userProgressApi.incrementProgress(userId, questionsCount, correctCount, timeSpent);
      await fetchStats();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return {
    stats,
    loading,
    updateProgress,
    refresh: fetchStats
  };
}
