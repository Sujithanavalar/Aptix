import { useState, useEffect } from 'react';
import { streakApi } from '@/db/api';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_login_date: string | null;
}

export function useStreak(userId: string | undefined) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setStreak(0);
      setLoading(false);
      return;
    }

    updateStreak();
  }, [userId]);

  const updateStreak = async () => {
    if (!userId) return;

    try {
      // Update streak in database (handles consecutive day logic)
      const data: StreakData = await streakApi.updateStreak(userId);
      setStreak(data.current_streak);
    } catch (error) {
      console.error('Error updating streak:', error);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  };

  return { streak, loading };
}
