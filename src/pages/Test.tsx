import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { topicsApi } from '@/db/api';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import type { Topic } from '@/types/types';
import {
  Target,
  Clock,
  TrendingUp,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Brain,
  Activity
} from 'lucide-react';
import TopicIcon from '@/components/common/TopicIcon';

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

export default function Test() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useProgress(user?.id);

  useEffect(() => {
    fetchTopics();
  }, []);

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

  const formatTime = (seconds: number) => {
    if (seconds === 0) return '0s';
    if (!seconds) return '--';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-[#0f2e6e] font-sans selection:bg-[#0f2e6e]/10 animate-fade-in relative overflow-x-hidden">

      {/* Background Decorative Blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0f2e6e]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#ff7f0e]/5 rounded-full blur-[120px]" />
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#0f2e6e] text-white pb-32 pt-10 md:pb-40 md:pt-16 rounded-b-[2.5rem] md:rounded-b-[6rem] overflow-hidden z-10">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Target className="absolute -right-16 -top-16 w-80 h-80 text-white rotate-12" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="pl-0 text-white/50 hover:text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-[0.3em] transition-all group rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Control Center
              </Button>
              <div>
                <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight mb-2 md:mb-4">
                  Assessment <br className="hidden md:block" />
                  <span className="text-[#ff7f0e] italic">Inventory.</span>
                </h1>
                <p className="text-xs md:text-base text-blue-100/60 max-w-md mx-auto md:mx-0 font-bold leading-relaxed px-4 md:px-0">
                  Validated testing protocols designed to measure your quantitative accuracy and solving pace.
                </p>
              </div>
            </div>

            <div className="hidden lg:block w-full max-w-sm relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ff7f0e] to-[#0f2e6e] rounded-[2.2rem] blur opacity-20 transition duration-1000"></div>
              <div className="relative bg-white/5 border border-white/10 p-8 rounded-[2.1rem] backdrop-blur-md group overflow-hidden">
                <div className="absolute -top-4 -right-4 bg-[#ff7f0e] text-white p-3.5 rounded-xl rotate-12 shadow-lg group-hover:rotate-0 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-[#ff7f0e] font-black text-[10px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                  Session Log
                </h3>
                <p className="text-lg font-black text-white italic leading-tight opacity-90">
                  "Speed is secondary; precision is the ultimate metric of mastery."
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
            { label: 'Today', val: statsLoading ? null : stats.questionsSolvedToday, icon: Target, color: 'text-[#ff7f0e]', bg: 'bg-[#ff7f0e]/5', sub: 'Daily Volume' },
            { label: 'Accuracy', val: statsLoading ? null : `${stats.averageScore}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/5', sub: 'Quality Rate' },
            { label: 'Status', val: 'Active', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-500/5', sub: 'Protocol' }
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

        {/* --- SECTION HEADER --- */}
        <div className="mb-8 md:mb-14 text-center px-2">
          <div className="inline-flex items-center gap-2 mb-3 px-4 md:px-5 py-1.5 rounded-full bg-white border-2 border-[#0f2e6e]/10 shadow-[0_0_20px_rgba(15,46,110,0.05)]">
            <Brain className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#0f2e6e]" />
            <span className="text-[8px] md:text-[10px] font-black text-[#0f2e6e] uppercase tracking-[0.3em]">Testing Protocols</span>
          </div>
          <h2 className="text-xl md:text-5xl font-black text-[#0f2e6e] tracking-tighter">
            Examination <span className="text-[#ff7f0e]">Center.</span>
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
                <Link key={topic.id} to={`/test/${topic.slug}`} className="group h-full">
                  <Card className={`relative h-full ${theme.cardBg} rounded-2xl md:rounded-[2rem] border-2 ${theme.border} transition-all duration-500 flex flex-col p-4 md:p-6 min-h-[160px] md:min-h-[240px] shadow-none hover:-translate-y-1`}>
                    <div className="flex-1">
                      <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-[1rem] flex items-center justify-center mb-3 md:mb-5 transition-all duration-500 ${theme.bg} ${theme.text} ${theme.hoverIconBg} group-hover:text-white group-hover:rotate-6`}>
                        <TopicIcon iconName={topic.icon} className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <h3 className="font-black text-sm md:text-lg text-black tracking-tight mb-1 md:mb-2 line-clamp-2 uppercase">
                        {topic.name}
                      </h3>
                      <p className="text-slate-500 text-[9px] md:text-[11px] font-bold leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-3 italic opacity-80">
                        "{topic.definition || "Standard assessment protocol focusing on theoretical application."}"
                      </p>
                    </div>
                    <div className="mt-3 md:mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                      <span className={theme.text}>Configure Test</span>
                      <ChevronRight className={`h-3 w-3 md:h-4 md:w-4 ${theme.text}`} />
                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}