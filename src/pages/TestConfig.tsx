import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { topicsApi, levelProgressApi } from '@/db/api';
import { useAuth } from '@/hooks/useAuth';
import type { Topic, DifficultyLevel } from '@/types/types';
import {
  ArrowLeft,
  Clock,
  FileQuestion,
  Target,
  ArrowRight,
  Lock,
  Trophy,
  Settings2,
  CheckCircle2
} from 'lucide-react';
import TopicIcon from '@/components/common/TopicIcon';

export default function TestConfig() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [questionCount, setQuestionCount] = useState(10);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [levelProgress, setLevelProgress] = useState<Record<string, { is_unlocked: boolean; highest_score: number }>>({
    easy: { is_unlocked: true, highest_score: 0 },
    medium: { is_unlocked: false, highest_score: 0 },
    hard: { is_unlocked: false, highest_score: 0 }
  });

  useEffect(() => {
    if (slug) {
      fetchTopic();
    }
  }, [slug]);

  useEffect(() => {
    if (topic && user?.id) {
      fetchLevelProgress();
    }
  }, [topic, user]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && topic && user?.id) {
        fetchLevelProgress();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [topic, user]);

  const fetchLevelProgress = async () => {
    if (!topic || !user?.id) return;
    try {
      await levelProgressApi.initializeTopicProgress(user.id, topic.id);
      await levelProgressApi.backfillFromAttempts(user.id, topic.id);
      const progress = await levelProgressApi.getUserTopicProgress(user.id, topic.id);
      const map: Record<string, { is_unlocked: boolean; highest_score: number }> = {
        easy: { is_unlocked: true, highest_score: 0 },
        medium: { is_unlocked: false, highest_score: 0 },
        hard: { is_unlocked: false, highest_score: 0 },
      };
      progress.forEach((p: any) => {
        map[p.difficulty] = {
          is_unlocked: p.is_unlocked,
          highest_score: p.highest_score
        };
      });
      if (map.easy.highest_score >= 80) {
        map.medium.is_unlocked = true;
      }
      if (map.medium.highest_score >= 80) {
        map.hard.is_unlocked = true;
      }
      setLevelProgress(map);
    } catch (error) {
      console.error('Error fetching level progress:', error);
    }
  };

  const fetchTopic = async () => {
    if (!slug) return;
    try {
      const data = await topicsApi.getBySlug(slug);
      setTopic(data);
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (!topic) return;

    const config = {
      topicId: topic.id,
      topicSlug: slug,
      difficulty,
      questionCount,
      timerEnabled,
      timeLimit: timerEnabled ? questionCount * 60 : null
    };

    navigate(`/test/${slug}/instructions`, { state: config });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!topic) return null;

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', description: 'Foundation basics', color: 'text-emerald-600' },
    { value: 'medium', label: 'Medium', description: 'Logical puzzles', color: 'text-amber-600' },
    { value: 'hard', label: 'Hard', description: 'Expert mastery', color: 'text-rose-600' }
  ];

  const questionOptions = [
    { value: 10, label: 'Quick', sub: '10 Qs' },
    { value: 20, label: 'Standard', sub: '20 Qs' },
    { value: 30, label: 'Focused', sub: '30 Qs' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">

        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/test')}
          className="mb-6 -ml-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>

        {/* Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-row items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0 p-3 sm:p-4 bg-primary/10 rounded-xl text-primary">
              <TopicIcon iconName={topic.icon} className="h-7 w-7 sm:h-9 sm:h-9" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{topic.name}</h1>
              <p className="text-slate-500 text-sm sm:text-base mt-0.5">Customize your practice session.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">

          {/* Difficulty Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Target className="h-4 w-4 text-slate-400" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Difficulty</h2>
            </div>

            <RadioGroup
              value={difficulty}
              onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
            >
              {difficultyOptions.map((opt) => {
                const isLocked = !levelProgress[opt.value]?.is_unlocked;
                const score = levelProgress[opt.value]?.highest_score || 0;

                return (
                  <div key={opt.value} className="relative group">
                    <RadioGroupItem value={opt.value} id={opt.value} className="peer sr-only" disabled={isLocked} />
                    <Label
                      htmlFor={opt.value}
                      className={`h-full flex flex-col p-4 sm:p-5 rounded-2xl border bg-white transition-all cursor-pointer shadow-sm min-h-[140px] sm:min-h-[160px] ${isLocked
                          ? 'opacity-60 cursor-not-allowed border-slate-200 grayscale-[0.5]'
                          : 'border-slate-200 hover:border-primary/40 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary/5'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-base font-bold ${!isLocked ? opt.color : 'text-slate-400'}`}>
                          {opt.label}
                        </span>
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-slate-400" />
                        ) : (
                          <CheckCircle2 className={`h-4 w-4 transition-opacity ${difficulty === opt.value ? 'text-primary' : 'opacity-0'}`} />
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-2">
                        {opt.description}
                      </p>

                      <div className="mt-auto pt-4 flex items-center gap-2">
                        {isLocked ? (
                          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-tight">Requires 80%+ Score</span>
                        ) : score > 0 ? (
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                            <Trophy className="h-3 w-3 text-amber-500" />
                            <span className="text-[10px] text-slate-700 font-bold">Best: {score}%</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">New Level</span>
                        )}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Question Count Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <FileQuestion className="h-4 w-4 text-slate-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Questions</h2>
              </div>
              <RadioGroup
                value={questionCount.toString()}
                onValueChange={(value) => setQuestionCount(Number(value))}
                className="grid grid-cols-1 gap-2"
              >
                {questionOptions.map((opt) => (
                  <div key={opt.value}>
                    <RadioGroupItem value={opt.value.toString()} id={`count-${opt.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`count-${opt.value}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white cursor-pointer transition-all hover:bg-slate-50/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/[0.02]"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${questionCount === opt.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {opt.value}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{opt.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{opt.sub}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </section>

            {/* Preferences Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Settings2 className="h-4 w-4 text-slate-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Preferences</h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center min-h-[178px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <Label htmlFor="timer" className="text-sm font-semibold cursor-pointer">Countdown Timer</Label>
                    <p className="text-xs text-slate-400">1 minute per question</p>
                  </div>
                  <Switch
                    id="timer"
                    checked={timerEnabled}
                    onCheckedChange={setTimerEnabled}
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimate</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {timerEnabled ? `${questionCount} Mins` : 'No Limit'}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/test')}
            className="w-full sm:w-auto h-12 text-slate-500 font-semibold"
          >
            Cancel Session
          </Button>
          <Button
            onClick={handleStartTest}
            className="w-full sm:flex-1 h-14 bg-primary text-primary-foreground font-bold text-base rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
          >
            Review Instructions
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}