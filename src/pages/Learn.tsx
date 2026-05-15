import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { topicsApi, testAttemptsApi } from '@/db/api';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { useStreak } from '@/hooks/useStreak';
import type { Topic, TestAttempt } from '@/types/types';
// @ts-ignore
import confetti from 'canvas-confetti';
import {
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Zap,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Brain,
  Sparkles,
  ArrowRight,
  Timer,
  Gamepad2,
  Flame,
  ZapOff,
  Trophy
} from 'lucide-react';
import TopicIcon from '@/components/common/TopicIcon';
import UserProfileModal from '@/components/common/UserProfileModal';

const getTopicTheme = (index: number) => {
  const themes = [
    {
      bg: 'bg-[#0f2e6e]/10',
      cardBg: 'bg-white',
      text: 'text-[#0f2e6e]',
      border: 'border-[#0f2e6e]/30',
      hoverIconBg: 'group-hover:bg-[#0f2e6e]',
    },
    {
      bg: 'bg-[#ff7f0e]/10',
      cardBg: 'bg-white',
      text: 'text-[#ff7f0e]',
      border: 'border-[#ff7f0e]/30',
      hoverIconBg: 'group-hover:bg-[#ff7f0e]',
    },
    {
      bg: 'bg-emerald-500/10',
      cardBg: 'bg-white',
      text: 'text-emerald-600',
      border: 'border-emerald-500/30',
      hoverIconBg: 'group-hover:bg-emerald-600',
    },
    {
      bg: 'bg-amber-500/10',
      cardBg: 'bg-white',
      text: 'text-amber-600',
      border: 'border-amber-500/30',
      hoverIconBg: 'group-hover:bg-amber-600',
    },
  ];
  return themes[index % themes.length];
};

export default function Learn() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentTests, setRecentTests] = useState<TestAttempt[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useProgress(user?.id);
  const { streak, loading: streakLoading } = useStreak(user?.id);

  // --- BRAIN SPRINT GAME STATE ---
  const [gameActive, setGameActive] = useState(false);
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+', ans: 0 });
  const [userInput, setUserInput] = useState('');
  const [gameScore, setGameScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  const gameTimerRef = useRef<any>(null);

  useEffect(() => {
    fetchTopics();
    if (user?.id) fetchRecentTests();
  }, [user?.id]);

  const fetchTopics = async () => {
    try {
      const data = await topicsApi.getAll();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTests = async () => {
    if (!user?.id) return;
    try {
      const data = await testAttemptsApi.getUserAttempts(user.id, 10);
      const completedTests = data.filter(test => !test.is_practice);
      setRecentTests(completedTests.slice(0, 5));
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return '0s';
    if (!seconds) return '--';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0f2e6e', '#ff7f0e', '#ffffff']
    });
  };

  const generateProblem = (currentLvl: number) => {
    let a, b, op, ans;
    if (currentLvl === 1) {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      op = '+';
    } else if (currentLvl === 2) {
      a = Math.floor(Math.random() * 20) + 5;
      b = Math.floor(Math.random() * 15) + 5;
      op = Math.random() > 0.5 ? '+' : '-';
    } else if (currentLvl === 3) {
      a = Math.floor(Math.random() * 10) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      op = '*';
    } else {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 20) + 5;
      op = Math.random() > 0.5 ? '*' : (Math.random() > 0.5 ? '+' : '-');
    }
    ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
    if (ans < 0) return generateProblem(currentLvl);
    setProblem({ a, b, op, ans });
  };

  const startGame = () => {
    setGameActive(true);
    setGameScore(0);
    setTimeLeft(10);
    setLevel(1);
    setUserInput('');
    generateProblem(1);
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && gameActive) {
      setGameActive(false);
      if (gameScore > highScore) setHighScore(gameScore);
      clearInterval(gameTimerRef.current);
    }
    return () => clearInterval(gameTimerRef.current);
  }, [gameActive, timeLeft, gameScore, highScore]);

  const handleGameInput = (val: string) => {
    setUserInput(val);
    const numVal = parseInt(val);
    if (numVal === problem.ans) {
      const nextScore = gameScore + 1;
      setGameScore(nextScore);
      setUserInput('');
      setTimeLeft((prev) => Math.min(prev + 1, 12));
      if (nextScore % 3 === 0) {
        const nextLvl = level + 1;
        setLevel(nextLvl);
        triggerConfetti();
        generateProblem(nextLvl);
      } else {
        generateProblem(level);
      }
    } else if (val.length >= problem.ans.toString().length) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      setLevel(1);
      generateProblem(1);
      setUserInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-[#0f2e6e] font-sans selection:bg-[#0f2e6e]/10 animate-fade-in relative overflow-x-hidden">

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0f2e6e]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#ff7f0e]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative bg-[#0f2e6e] text-white pb-32 pt-10 md:pb-40 md:pt-16 rounded-b-[2.5rem] md:rounded-b-[6rem] overflow-hidden z-10">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <BookOpen className="absolute -right-16 -top-16 w-80 h-80 text-white rotate-12" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <Button
                variant="ghost"
                onClick={() => navigate('/home')}
                className="pl-0 text-white/50 hover:text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-[0.3em] transition-all group rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Workspace
              </Button>
              <div>
                <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight mb-2 md:mb-4">
                  Learning <br className="hidden md:block" />
                  <span className="text-[#ff7f0e] italic">Inventory.</span>
                </h1>
                <p className="text-xs md:text-base text-blue-100/60 max-w-md mx-auto md:mx-0 font-bold leading-relaxed px-4 md:px-0">
                  Modular theoretical logs designed for cognitive development and mastery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 md:px-10 -mt-16 md:-mt-24 pb-20 relative z-20">

        {/* --- STATS DASHBOARD --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-10 md:mb-20 animate-in slide-in-from-bottom-5 duration-500">
          {[
            { label: 'Avg Pace', val: statsLoading ? null : formatTime(stats.averageTime), icon: Clock, color: 'text-[#0f2e6e]', bg: 'bg-[#0f2e6e]/5', sub: 'Solve Speed' },
            { label: 'Completed', val: statsLoading ? null : stats.questionsSolvedThisWeek, icon: Target, color: 'text-[#ff7f0e]', bg: 'bg-[#ff7f0e]/5', sub: 'Weekly Log' },
            { label: 'Accuracy', val: statsLoading ? null : `${stats.averageScore}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/5', sub: 'Quality Rate' },
            { label: 'Streak', val: streakLoading ? null : streak, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-500/5', sub: 'Daily Streak' }
          ].map((s, i) => (
            <Card key={i} className="bg-white border-2 border-[#0f2e6e]/20 rounded-2xl md:rounded-[2.2rem] overflow-hidden hover:-translate-y-1 transition-all duration-500 group shadow-[0_0_15px_rgba(15,46,110,0.05)]">
              <CardContent className="p-4 md:p-7">
                <div className="flex justify-between items-start mb-2 md:mb-5">
                  <div>
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</span>
                    <h3 className="text-base md:text-2xl font-black text-[#0f2e6e] mt-0.5 md:mt-1 tracking-tighter">
                      {s.val === null ? <Skeleton className="h-6 w-10 md:w-16" /> : s.val}
                    </h3>
                  </div>
                  <div className={`p-1.5 md:p-3 rounded-lg md:rounded-2xl ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>
                    <s.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                </div>
                <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- HUB HEADER --- */}
        <div className="mb-8 md:mb-14 text-center px-2">
          <div className="inline-flex items-center gap-2 mb-3 px-4 md:px-5 py-1.5 rounded-full bg-white border-2 border-[#0f2e6e]/10 shadow-[0_0_20px_rgba(15,46,110,0.05)]">
            <Brain className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#0f2e6e]" />
            <span className="text-[8px] md:text-[10px] font-black text-[#0f2e6e] uppercase tracking-[0.3em]">Knowledge Hub</span>
          </div>
          <h2 className="text-xl md:text-5xl font-black text-[#0f2e6e] tracking-tighter uppercase">
            Knowledge <span className="text-[#ff7f0e]">Modules.</span>
          </h2>
        </div>

        {/* --- TOPICS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-16 md:mb-32">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 md:h-64 w-full rounded-2xl" />)
          ) : (
            topics.map((topic, index) => {
              const theme = getTopicTheme(index);
              return (
                <Link key={topic.id} to={`/learn/${topic.slug}`} className="group h-full">
                  <Card className={`relative h-full ${theme.cardBg} rounded-2xl md:rounded-[2rem] border-2 ${theme.border} transition-all duration-500 flex flex-col p-4 md:p-6 min-h-[160px] md:min-h-[240px] shadow-none hover:-translate-y-1`}>
                    <div className="flex-1">
                      <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-[1rem] flex items-center justify-center mb-3 md:mb-5 transition-all duration-500 ${theme.bg} ${theme.text} ${theme.hoverIconBg} group-hover:text-white group-hover:rotate-6`}>
                        <TopicIcon iconName={topic.icon} className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <h3 className="font-black text-sm md:text-lg text-black tracking-tight mb-1 md:mb-2 line-clamp-2 uppercase">
                        {topic.name}
                      </h3>
                      <p className="text-slate-500 text-[9px] md:text-[11px] font-bold leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-3 italic opacity-80">
                        "{topic.definition || "Foundation analytical study module."}"
                      </p>
                    </div>
                    <div className="mt-3 md:mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                      <span className={theme.text}>Initialize</span>
                      <ChevronRight className={`h-3 w-3 md:h-4 md:w-4 ${theme.text}`} />
                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* --- SPRINT SECTION --- */}
        <section className="mb-16 md:mb-32">
          <Card className={`bg-[#0f2e6e] text-white rounded-[2rem] md:rounded-[3.5rem] overflow-hidden relative border-2 border-[#0f2e6e]/40 transition-all duration-300 shadow-[0_0_30px_rgba(15,46,110,0.1)] ${isShaking ? 'animate-shake' : ''} ${gameActive && timeLeft < 4 ? 'ring-4 md:ring-8 ring-red-500/30' : ''}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Gamepad2 className="h-40 w-40 md:h-64 md:w-64 rotate-12" />
            </div>

            <CardContent className="p-5 md:p-16 relative z-10">
              <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center text-center md:text-left">
                <div className="space-y-3 md:space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-[#ff7f0e]" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">Adrenaline Mode</span>
                  </div>
                  <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase">Aptix <span className="italic text-[#ff7f0e]">Sprint.</span></h2>
                  <p className="text-[10px] md:text-sm text-blue-100/60 font-bold leading-relaxed max-w-sm mx-auto md:mx-0 italic">
                    Level spikes every 3 correct hits. Reset on error. Speed is power.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-3 md:gap-8 pt-2">
                    <div className="bg-white/5 p-2 md:p-4 px-4 md:px-6 rounded-xl md:rounded-3xl border border-white/10">
                      <p className="text-[7px] md:text-[9px] font-black uppercase text-[#ff7f0e] tracking-widest mb-0.5">High Score</p>
                      <p className="text-lg md:text-3xl font-black text-white">{highScore}</p>
                    </div>
                    <div className="bg-white/5 p-2 md:p-4 px-4 md:px-6 rounded-xl md:rounded-3xl border border-white/10">
                      <p className="text-[7px] md:text-[9px] font-black uppercase text-[#ff7f0e] tracking-widest mb-0.5">Active Tier</p>
                      <p className="text-xs md:text-sm font-bold text-white flex items-center gap-1.5 uppercase">
                        {level} <Flame className={`h-3 w-3 fill-[#ff7f0e] text-[#ff7f0e] ${gameActive ? 'animate-pulse' : ''}`} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {!gameActive ? (
                    <div className="bg-white/10 border-2 border-white/20 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] text-center backdrop-blur-xl group">
                      <div className="h-12 w-12 md:h-16 md:w-16 bg-[#ff7f0e] rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="h-6 w-6 md:h-8 md:w-8 text-white fill-current" />
                      </div>
                      <h4 className="text-base md:text-xl font-black mb-1 tracking-tight">Prime Engine</h4>
                      <p className="text-blue-100/40 text-[8px] md:text-[10px] font-black uppercase mb-5 tracking-widest">Logic Fire Drill</p>
                      <Button onClick={startGame} className="w-full h-11 md:h-14 rounded-xl md:rounded-2xl bg-[#ff7f0e] text-white font-black uppercase text-[10px] tracking-widest hover:bg-[#ff7f0e]/90 transition-all border-none">
                        Initialize
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 text-[#0f2e6e] ring-2 ring-[#0f2e6e]/20 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-5 md:mb-8">
                        <div className={`flex items-center gap-1.5 md:gap-2 transition-colors ${timeLeft < 4 ? 'text-red-500 scale-105' : 'text-[#0f2e6e]'}`}>
                          <Timer className={`h-4 w-4 md:h-6 md:w-6 ${timeLeft < 4 ? 'animate-bounce' : ''}`} />
                          <span className="font-black text-lg md:text-2xl tabular-nums">{timeLeft}s</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 bg-[#ff7f0e]/10 px-3 md:px-5 py-1 md:py-2 rounded-full border border-[#ff7f0e]/20">
                          <Trophy className="h-4 w-4 md:h-5 md:w-5 text-[#ff7f0e] fill-current" />
                          <span className="font-black text-sm md:text-lg text-[#ff7f0e]">{gameScore}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full mb-6 md:mb-10 overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 4 ? 'bg-red-500' : 'bg-[#0f2e6e]'}`} style={{ width: `${(timeLeft / 12) * 100}%` }} />
                      </div>
                      <div className="text-center mb-6 h-16 md:h-24 flex items-center justify-center">
                        <p className={`text-4xl md:text-6xl font-black tracking-tighter text-[#0f2e6e] transition-all ${timeLeft < 4 ? 'scale-105' : ''}`}>
                          {problem.a} <span className="text-[#ff7f0e] mx-2 md:mx-3">{problem.op}</span> {problem.b}
                        </p>
                      </div>
                      <Input autoFocus type="number" placeholder="?" value={userInput} onChange={(e) => handleGameInput(e.target.value)} className={`h-14 md:h-20 text-center text-2xl md:text-4xl font-black rounded-xl md:rounded-3xl border-4 transition-all mb-3 text-[#0f2e6e] ${isShaking ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-100 focus:border-[#0f2e6e]'}`} />
                      <Button onClick={() => setTimeLeft(0)} variant="ghost" className="w-full text-slate-300 text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:text-red-500 gap-1"><ZapOff className="h-3 w-3" /> Stop</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* --- MISSION LOG --- */}
        {recentTests.length > 0 && (
          <div className="animate-in fade-in duration-1000 space-y-6 md:space-y-10">
            <div className="flex items-center gap-3 px-1">
              <div className="h-8 md:h-10 w-1.5 bg-[#ff7f0e] rounded-full" />
              <h2 className="text-lg md:text-3xl font-black text-[#0f2e6e] tracking-tighter uppercase tracking-[0.2em]">Mission Log.</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {recentTests.map((test, i) => {
                const topic = topics.find(t => t.id === test.topic_id);
                const scorePercentage = Math.round((test.score / test.total_questions) * 100);
                const scoreColor = scorePercentage >= 80 ? 'text-emerald-500' : scorePercentage >= 60 ? 'text-[#ff7f0e]' : 'text-rose-500';
                return (
                  <Card key={i} className="bg-white border-2 border-[#0f2e6e]/10 rounded-2xl md:rounded-[2.5rem] transition-all duration-500 group hover:-translate-x-1 shadow-none overflow-hidden">
                    <CardContent className="p-4 md:p-9 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                      <div className="flex items-center gap-4 md:gap-6 flex-1">
                        <div className="h-10 w-10 md:h-14 md:w-14 bg-[#0f2e6e]/5 border-2 border-[#0f2e6e]/10 rounded-xl md:rounded-[1.2rem] flex items-center justify-center text-slate-400 group-hover:bg-[#0f2e6e] group-hover:text-white transition-all">
                          <TopicIcon iconName={topic?.icon || 'BookOpen'} className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div>
                          <h3 className="text-sm md:text-lg font-black text-[#0f2e6e] tracking-tight mb-0.5 md:mb-1 uppercase">{topic?.name || 'Theory Test'}</h3>
                          <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            <Calendar className="h-2.5 w-2.5" /> {new Date(test.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-5 md:gap-10 md:min-w-[350px] border-t md:border-t-0 pt-3 md:pt-0">
                        <div className="text-left md:text-right">
                          <p className="text-[7px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Speed</p>
                          <p className="text-[10px] md:text-sm font-black text-[#0f2e6e] flex items-center gap-1.5 md:justify-end">
                            <Clock className="h-3 w-3 text-[#ff7f0e]" /> {test.time_taken ? formatTime(test.time_taken) : '--'}
                          </p>
                        </div>
                        <div className="text-right border-l pl-5 md:pl-10 border-[#0f2e6e]/10">
                          <p className="text-[7px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Score</p>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xl md:text-3xl font-black ${scoreColor} tracking-tighter`}>{test.score}</span>
                            <span className="text-[8px] md:text-[10px] font-black text-slate-300">/ {test.total_questions}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {recentTests.length >= 5 && (
              <div className="text-center pt-2 md:pt-8">
                <Button variant="outline" onClick={() => setShowHistoryModal(true)} className="rounded-xl md:rounded-[1.5rem] border-2 border-[#0f2e6e]/10 text-[#0f2e6e] font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] px-10 md:px-12 h-11 md:h-16 bg-white hover:bg-[#0f2e6e] hover:text-white transition-all">
                  Full Analytics <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      <UserProfileModal open={showHistoryModal} onOpenChange={setShowHistoryModal} />
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-0.5deg); }
          40% { transform: translateX(8px) rotate(0.5deg); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out 0s 2; }
        .animate-spin-slow { animation: spin 6s linear infinite; }
      `}</style>
    </div>
  );
}