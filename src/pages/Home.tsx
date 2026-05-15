import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
// @ts-ignore
import confetti from 'canvas-confetti';
import {
  Brain,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  Zap,
  ChevronDown,
  Sparkles,
  Trophy,
  PlayCircle,
  Lightbulb,
  ArrowRight,
  Timer,
  Gamepad2,
  Flame,
  ZapOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { useStreak } from '@/hooks/useStreak';
import { topicsApi } from '@/db/api';
import type { Topic } from '@/types/types';
import TopicIcon from '@/components/common/TopicIcon';

const motivationalQuotes = [
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Consistent practice leads to mastery.",
  "Every problem solved is a step toward excellence.",
  "Knowledge is power when applied with precision.",
];

export default function Home() {
  const { isAuthenticated, user, profile } = useAuth();
  const { stats, loading: statsLoading } = useProgress(user?.id);
  const { streak, loading: streakLoading } = useStreak(user?.id);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const navigate = useNavigate();

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
    if (isAuthenticated && profile && profile.has_setup_password === false) {
      navigate('/setup-password');
    }
  }, [isAuthenticated, profile, navigate]);

  const displayName =
    user?.user_metadata?.display_name ||
    profile?.username ||
    ((profile?.role === 'admin' || localStorage.getItem('lastRole') === 'admin') ? 'Admin' :
      ((profile?.role === 'staff' || localStorage.getItem('lastRole') === 'staff') ? 'Faculty' : 'Learner'));

  useEffect(() => {
    fetchTopics();
    setGreetingMessage();
    setRandomQuote();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await topicsApi.getAll();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setTopicsLoading(false);
    }
  };

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

  const setRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const toggleTopic = (id: number) => {
    setExpandedTopic(expandedTopic === id ? null : id);
  };

  // --- GAME LOGIC ---
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
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
    <div className="min-h-screen bg-[#f4f7fa] text-[#0f2e6e] font-sans selection:bg-[#0f2e6e]/10 selection:text-[#0f2e6e] animate-fade-in relative overflow-x-hidden">
      {/* Playful Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-[#0f2e6e]/5 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-[#ff7f0e]/5 rounded-full blur-[130px]" />
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#0f2e6e] text-white pb-32 pt-12 md:pt-20 rounded-b-[3rem] md:rounded-b-[5rem] shadow-none overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <BookOpen className="absolute -right-20 -top-20 w-[400px] h-[400px] text-white rotate-12" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-8 text-center md:text-left">
              {isAuthenticated && (
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-sm group hover:bg-white/20 transition-all cursor-default">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff7f0e] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff7f0e]"></span>
                  </div>
                  <span className="text-xs md:text-sm font-black uppercase tracking-widest text-[#f4f7fa]">
                    {greeting}, <span className="text-[#ff7f0e] italic group-hover:text-white transition-colors">{displayName}</span>
                  </span>
                </div>
              )}

              <div className="px-2 md:px-0">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] md:leading-[0.95] mb-6 drop-shadow-sm text-white">
                  Elevate Your <br className="hidden md:block" />
                  <span className="text-[#ff7f0e] italic">Aptitude & Logic.</span>
                </h1>
                <p className="text-sm md:text-lg text-blue-100/60 max-w-lg mx-auto md:mx-0 font-medium leading-relaxed">
                  A high-resolution workspace designed to master complex analytical sets, track your evolution, and sharpen reasoning skills.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                <Link to={isAuthenticated ? '/learn' : '/login'} className="w-[48%] md:w-auto">
                  <Button className="w-full h-14 md:h-16 px-6 md:px-10 bg-[#ff7f0e] hover:bg-[#ff7f0e]/90 text-white font-bold text-[15px] md:text-[17px] tracking-tight rounded-2xl active:scale-95 transition-all group shadow-lg shadow-[#ff7f0e]/20">
                    Start Learning <ArrowRight className="ml-2 h-5 w-5 hidden md:inline group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={isAuthenticated ? '/test' : '/login'} className="w-[48%] md:w-auto">
                  <Button variant="outline" className="w-full h-14 md:h-16 px-6 md:px-10 bg-white/5 border-2 border-white/20 text-white hover:bg-white/10 font-bold text-[15px] md:text-[17px] tracking-tight rounded-2xl backdrop-blur-sm transition-all active:scale-95">
                    Solve Problems
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block w-full max-w-sm relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ff7f0e] to-[#0f2e6e] rounded-[2.6rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md shadow-2xl group overflow-hidden">
                <div className="absolute -top-5 -right-5 bg-[#ff7f0e] text-white p-4 rounded-2xl shadow-xl rotate-12 transition-transform group-hover:rotate-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-[#ff7f0e] font-black text-[10px] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <div className="w-6 h-[1px] bg-[#ff7f0e]/50"></div> Daily Strategy
                </h3>
                <p className="text-xl font-bold text-white italic leading-tight tracking-tight opacity-90">
                  "{quote}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-16 md:-mt-24 pb-20 relative z-20">

        {/* --- STATS DASHBOARD --- */}
        {isAuthenticated && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-12 md:mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {[
              { label: 'Pace', val: statsLoading ? null : formatTime(stats.averageTime), sub: 'Stability: Normal', icon: Clock, color: 'text-[#0f2e6e]' },
              { label: 'Solved', val: statsLoading ? null : stats.questionsSolvedThisWeek, sub: 'High Volume', icon: Target, color: 'text-[#ff7f0e]' },
              { label: 'Quality', val: statsLoading ? null : `${stats.averageScore}%`, sub: 'Elite Logic', icon: TrendingUp, color: 'text-emerald-600' },
              { label: 'Streak', val: streakLoading ? null : streak, sub: 'Daily Focus', icon: Zap, color: 'text-amber-600', isZap: true }
            ].map((stat, idx) => (
              <Card key={idx} className="bg-white border-2 border-[#0f2e6e]/20 rounded-2xl md:rounded-[2.5rem] overflow-hidden hover:-translate-y-1 transition-all duration-500 group shadow-none">
                <CardContent className="p-4 md:p-8">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 block truncate">{stat.label}</span>
                      <h3 className="text-lg md:text-3xl font-black text-[#0f2e6e] mt-0.5 md:mt-1 tracking-tighter">
                        {stat.val === null ? <Skeleton className="h-6 w-12 md:h-8 md:w-20" /> : stat.val}
                      </h3>
                      <div className={`mt-2 md:mt-4 flex items-center gap-1 text-[8px] md:text-[9px] font-black px-1.5 md:px-2 py-1 rounded-lg uppercase tracking-widest bg-slate-50 ${stat.color}`}>
                        {stat.sub}
                      </div>
                    </div>
                    <div className={`shrink-0 flex items-center justify-center h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl transition-all shadow-inner ${stat.isZap && streak > 0 ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-[#0f2e6e]/5 group-hover:text-[#0f2e6e]'}`}>
                      <stat.icon className={`h-5 w-5 md:h-7 md:w-7 ${stat.isZap && streak > 0 ? 'fill-current animate-pulse' : ''}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* --- APTIX SPRINT ENGINE --- */}
        <section className="mb-20 md:mb-24 px-1 md:px-0">
          <Card className={`bg-[#0f2e6e] text-white rounded-[2rem] md:rounded-[3.5rem] overflow-hidden relative border-2 border-[#0f2e6e]/40 transition-all duration-300 shadow-none ${isShaking ? 'animate-shake' : ''} ${gameActive && timeLeft < 4 ? 'ring-4 md:ring-8 ring-red-500/30' : ''}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Gamepad2 className="h-40 w-40 md:h-64 md:w-64 rotate-12" />
            </div>

            <CardContent className="p-6 md:p-16 relative z-10">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center text-center md:text-left">
                <div className="space-y-4 md:space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/10 border border-white/20">
                    <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-[#ff7f0e]" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">Adrenaline Mode</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Aptix <span className="italic text-[#ff7f0e]">Sprint.</span></h2>
                  <p className="text-[11px] md:text-sm text-blue-100/60 font-bold leading-relaxed max-w-sm mx-auto md:mx-0 italic">
                    Level up every 3 correct hits. Reset on error. Speed is power.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-4 md:gap-8 pt-2">
                    <div className="bg-white/5 p-3 md:p-4 px-5 md:px-8 rounded-2xl md:rounded-3xl border border-white/10">
                      <p className="text-[8px] md:text-[9px] font-black uppercase text-[#ff7f0e] tracking-widest mb-0.5">Best</p>
                      <p className="text-xl md:text-3xl font-black text-white">{highScore}</p>
                    </div>
                    <div className="bg-white/5 p-3 md:p-4 px-5 md:px-8 rounded-2xl md:rounded-3xl border border-white/10">
                      <p className="text-[8px] md:text-[9px] font-black uppercase text-[#ff7f0e] tracking-widest mb-0.5">Tier</p>
                      <p className="text-base md:text-sm font-bold text-white flex items-center gap-1.5 uppercase">
                        {level} <Flame className={`h-4 w-4 fill-[#ff7f0e] text-[#ff7f0e] ${gameActive ? 'animate-pulse' : ''}`} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {!gameActive ? (
                    <div className="bg-white/10 border-2 border-white/20 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-center backdrop-blur-xl group">
                      <div className="h-14 w-14 md:h-16 md:w-16 bg-[#ff7f0e] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                        <Zap className="h-7 w-7 md:h-8 md:w-8 text-white fill-current" />
                      </div>
                      <h4 className="text-lg md:text-xl font-black mb-1 tracking-tight uppercase">Logic Drill</h4>
                      <p className="text-blue-100/40 text-[9px] md:text-[10px] font-black uppercase mb-6 tracking-[0.2em]">10s Survival</p>
                      <Button onClick={startGame} className="w-full h-12 md:h-14 rounded-2xl bg-[#ff7f0e] text-white font-black uppercase text-[11px] tracking-widest hover:bg-[#ff7f0e]/90 border-none shadow-lg">
                        Ignite Engine
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-[#0f2e6e] ring-2 ring-[#0f2e6e]/20 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                      <div className="flex justify-between items-center mb-6 md:mb-8">
                        <div className={`flex items-center gap-2 transition-colors ${timeLeft < 4 ? 'text-red-500 scale-105' : 'text-[#0f2e6e]'}`}>
                          <Timer className={`h-5 w-5 md:h-6 md:w-6 ${timeLeft < 4 ? 'animate-bounce' : ''}`} />
                          <span className="font-black text-xl md:text-2xl tabular-nums">{timeLeft}s</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#ff7f0e]/10 px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-[#ff7f0e]/20">
                          <Trophy className="h-4 w-4 md:h-5 md:w-5 text-[#ff7f0e] fill-current animate-spin-slow" />
                          <span className="font-black text-base md:text-lg text-[#ff7f0e]">{gameScore}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full mb-8 md:mb-10 overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 4 ? 'bg-red-500' : 'bg-[#0f2e6e]'}`} style={{ width: `${(timeLeft / 12) * 100}%` }} />
                      </div>
                      <div className="text-center mb-8 h-16 md:h-24 flex items-center justify-center">
                        <p className={`text-4xl md:text-6xl font-black tracking-tighter text-[#0f2e6e] transition-all ${timeLeft < 4 ? 'scale-105' : ''}`}>
                          {problem.a} <span className="text-[#ff7f0e] mx-3 md:mx-4">{problem.op}</span> {problem.b}
                        </p>
                      </div>
                      <Input autoFocus type="number" placeholder="?" value={userInput} onChange={(e) => handleGameInput(e.target.value)} className={`h-16 md:h-20 text-center text-3xl md:text-4xl font-black rounded-2xl md:rounded-3xl border-4 transition-all mb-4 text-[#0f2e6e] ${isShaking ? 'border-red-500' : 'border-slate-100 focus:border-[#0f2e6e]'}`} />
                      <Button onClick={() => setTimeLeft(0)} variant="ghost" className="w-full text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-500"><ZapOff className="h-3 w-3 mr-1" /> Terminate</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* --- KNOWLEDGE HUB --- */}
        <div className="mb-14 text-center relative">
          <div className="inline-flex items-center gap-3 mb-5 px-6 py-2 rounded-full bg-white border-2 border-[#0f2e6e]/10 shadow-none">
            <Brain className="h-4 w-4 text-[#0f2e6e]" />
            <span className="text-[10px] font-black text-[#0f2e6e] uppercase tracking-[0.4em]">Inventory Hub</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0f2e6e] tracking-tighter drop-shadow-sm uppercase">
            Knowledge <span className="text-[#ff7f0e]">Modules.</span>
          </h2>
          <p className="mt-4 text-slate-400 font-bold text-[11px] uppercase tracking-[0.25em]">Modular Learning Paths</p>
        </div>

        {/* --- TOPICS LIST --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-24">
          {topicsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-[2.5rem] bg-white/50" />
            ))
          ) : (
            topics.map((topic) => {
              const isExpanded = expandedTopic === topic.id;
              return (
                <div key={topic.id} className={`transition-all duration-500 ease-out ${isExpanded ? 'md:col-span-2' : ''}`}>
                  <div
                    onClick={() => toggleTopic(topic.id)}
                    className={`group relative bg-white border-2 transition-all duration-300 overflow-hidden rounded-[2rem] md:rounded-[2.5rem] ${isExpanded ? 'border-[#0f2e6e]/20 shadow-xl bg-white scale-[1.01]' : 'border-transparent shadow-sm hover:border-[#0f2e6e]/10 hover:-translate-y-1'}`}
                  >
                    <div className="p-6 md:p-9 flex items-center justify-between gap-4 md:gap-6">
                      <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                        <div className={`shrink-0 h-14 w-14 md:h-18 md:w-18 flex items-center justify-center rounded-2xl md:rounded-[1.8rem] transition-all duration-500 ${isExpanded ? 'bg-[#0f2e6e] text-white shadow-lg' : 'bg-[#0f2e6e]/5 text-[#0f2e6e] group-hover:bg-[#0f2e6e] group-hover:text-white group-hover:rotate-6'}`}>
                          <TopicIcon iconName={topic.icon || 'BookOpen'} className="h-7 w-7 md:h-8 md:w-8" />
                        </div>
                        <div className="min-w-0">
                          <h3 className={`font-black text-lg md:text-2xl tracking-tight truncate ${isExpanded ? 'text-[#0f2e6e]' : 'text-slate-800'}`}>
                            {topic.name}
                          </h3>
                          {!isExpanded && (
                            <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1 group-hover:text-slate-600">Access Briefing & Sets</p>
                          )}
                        </div>
                      </div>
                      <div className={`shrink-0 p-3 md:p-4 rounded-xl md:rounded-[1.2rem] transition-all ${isExpanded ? 'bg-[#ff7f0e] text-white rotate-180 shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                        <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                    </div>

                    <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="px-6 pb-8 md:px-9 md:pb-10 pt-2 md:pl-[120px]">
                          <div className="h-px bg-slate-100 mb-6 md:mb-8" />
                          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                            <div className="flex-1 space-y-4">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ff7f0e]/5 border border-[#ff7f0e]/10">
                                <Lightbulb className="h-3.5 w-3.5 text-[#ff7f0e]" />
                                <span className="text-[9px] font-black text-[#ff7f0e] uppercase tracking-widest">Strategy</span>
                              </div>
                              <p className="text-slate-500 leading-relaxed text-sm md:text-lg font-bold italic">
                                "{topic.definition || "Quantitative mastery module focusing on professional logic sets."}"
                              </p>
                            </div>
                            <Link to={isAuthenticated ? `/learn` : '/login'} className="w-full md:w-auto">
                              <Button className="w-full md:w-auto bg-[#0f2e6e] text-white px-8 h-14 md:h-16 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">
                                Initialize Lab <PlayCircle className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- CTA SECTION --- */}
        {!isAuthenticated && (
          <div className="bg-[#0f2e6e] rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 text-center shadow-none relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="grid grid-cols-6 gap-10 rotate-12 -translate-y-20">
                {Array.from({ length: 12 }).map((_, i) => <Brain key={i} className="w-32 h-32" />)}
              </div>
            </div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <div className="inline-block p-4 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/10">
                <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-[#ff7f0e] animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                Ready for <br /> <span className="text-[#ff7f0e] italic underline decoration-white/10 underline-offset-8">Precision Thinking?</span>
              </h2>
              <p className="text-blue-100/60 text-sm md:text-lg font-bold">Join the community to track logic gaps and metrics.</p>
              <Link to="/login" className="inline-block">
                <Button size="lg" className="bg-[#ff7f0e] text-white px-10 md:px-14 h-16 md:h-20 rounded-[2rem] text-[12px] md:text-[13px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                  Initialize Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-0.5deg); }
          40% { transform: translateX(8px) rotate(0.5deg); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out 0s 2; }
        .animate-spin-slow { animation: spin 6s linear infinite; }
      `}</style>
    </div>
  );
}