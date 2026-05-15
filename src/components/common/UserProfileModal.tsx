import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { useToast } from '@/hooks/use-toast';
import { testAttemptsApi, sharedReportsApi } from '@/db/api';
import type { TestAttempt } from '@/types/types';
import {
  User,
  Download,
  Award,
  Zap,
  Mail,
  IdCard,
  Building2,
  History,
  ShieldCheck,
  Activity,
  Share2,
  GraduationCap,
  LayoutDashboard,
  ExternalLink,
  Target,
  Layers,
  X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { user, profile } = useAuth();
  const { stats } = useProgress(user?.id);
  const { toast } = useToast();

  const [testHistory, setTestHistory] = useState<TestAttempt[]>([]);
  const [sharingLink, setSharingLink] = useState(false);
  const progressCardRef = useRef<HTMLDivElement>(null);

  const isStudent = profile?.role === 'user';
  const isStaff = profile?.role === 'staff';
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (user && open && isStudent) {
      fetchTestHistory();
    }
  }, [user, open, isStudent]);

  const fetchTestHistory = async () => {
    if (!user) return;
    try {
      const data = await testAttemptsApi.getRecentAttempts(user.id, 30);
      setTestHistory(data);
    } catch (error) {
      console.error('Error fetching test history:', error);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const handleGenerateShareLink = async () => {
    if (!user || !profile) return;
    setSharingLink(true);
    try {
      const reportData = {
        stats,
        weeklyData: getWeeklyData(),
        achievements: {
          bestScore: bestScoreData.score,
          bestScoreDate: bestScoreData.date,
          fastestTime: fastestTimeData.time,
          fastestTimeDate: fastestTimeData.date,
          totalQuestions: testHistory.reduce((sum, t) => sum + t.total_questions, 0),
          totalTests: testHistory.length
        }
      };
      const sharedReport = await sharedReportsApi.create(user.id, profile.username, reportData);
      const shareUrl = `${window.location.origin}/shared/${sharedReport.share_id}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Aptix Performance: ${profile.username}`,
            text: `Check out my latest performance metrics on Aptix! I've achieved an average accuracy of ${stats.averageScore}%. View full report:`,
            url: shareUrl,
          });
          toast({ title: 'Shared Successfully' });
        } catch (shareError) {
          if ((shareError as Error).name !== 'AbortError') {
            copyToClipboard(shareUrl);
          }
        }
      } else {
        copyToClipboard(shareUrl);
      }
    } catch (error) {
      toast({ title: 'Sharing Failed', variant: 'destructive' });
    } finally {
      setSharingLink(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied!',
      description: 'Your browser copied the report link to your clipboard.'
    });
  };

  const handleDownloadReport = async () => {
    if (!progressCardRef.current) return;
    try {
      const dataUrl = await toPng(progressCardRef.current, {
        quality: 1,
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `${profile?.username}-aptix-report.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: 'Success', description: 'Downloaded.' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const getWeeklyData = () => {
    const now = new Date();
    const dayMap = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const s = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap.set(s, { score: 0 });
    }
    testHistory.forEach(test => {
      const dateStr = new Date(test.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dayMap.has(dateStr)) {
        const val = dayMap.get(dateStr);
        const pct = Math.round((test.score / test.total_questions) * 100);
        val.score = Math.max(val.score, pct);
      }
    });
    return Array.from(dayMap.entries()).map(([date, data]) => ({ date, score: data.score }));
  };

  const weeklyData = getWeeklyData();
  const bestScoreData = testHistory.reduce((acc, t) => {
    const s = Math.round((t.score / t.total_questions) * 100);
    return s >= acc.score ? { score: s, date: new Date(t.completed_at).toLocaleDateString() } : acc;
  }, { score: 0, date: 'N/A' });

  const fastestTimeData = testHistory.reduce((acc, t) => {
    const avg = (t.time_taken || 0) / t.total_questions;
    return (avg < acc.time && avg > 0) ? { time: avg, date: new Date(t.completed_at).toLocaleDateString() } : acc;
  }, { time: Infinity, date: 'N/A' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-none bg-white rounded-[1.5rem] shadow-2xl focus:ring-0 max-w-[95vw] md:max-w-[1000px] w-full duration-500 ease-in-out sm:max-w-[1000px] [&_button[data-slot=dialog-close]]:hidden">
        <div className="sr-only">
          <DialogTitle>User Profile - {profile?.username}</DialogTitle>
          <DialogDescription>Personal identification and performance metrics dashboard for {profile?.username}.</DialogDescription>
        </div>

        {/* Unified Manual Close Button (Fixed positioning that works across all layers) */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-[200] p-2.5 rounded-full bg-white/10 md:bg-slate-100/80 text-white md:text-slate-500 hover:bg-rose-500 hover:text-white md:hover:bg-rose-50 md:hover:text-rose-600 transition-all shadow-lg active:scale-90"
          aria-label="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] h-[90vh] md:h-[620px] w-full min-w-0 overflow-y-auto md:overflow-hidden relative">

          {/* SIDEBAR: Personal Identification */}
          <div className="w-full md:w-[280px] bg-[#0f2e6e] flex flex-col shrink-0 relative overflow-hidden h-fit md:h-full group">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,127,14,0.1),transparent_60%)] pointer-events-none" />

            <div className="p-6 md:p-8 flex flex-col h-full relative z-10 w-full overflow-y-auto md:overflow-y-auto custom-scrollbar">
              {/* Profile Avatar & Title */}
              <div className="mb-6 md:mb-8 text-center md:text-left flex flex-col items-center md:items-start shrink-0">
                <div className="relative mb-4 group/avatar">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.2rem] md:rounded-[1.6rem] bg-white p-1 shadow-xl ring-4 ring-white/5 transition-transform duration-500 group-hover/avatar:scale-105">
                    <div className="w-full h-full rounded-[1rem] md:rounded-[1.3rem] bg-slate-100 flex items-center justify-center overflow-hidden">
                      <User className="w-8 h-8 md:w-10 md:h-10 text-[#0f2e6e]/20" />
                    </div>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-lg md:rounded-xl flex items-center justify-center border-2 md:border-4 border-[#0f2e6e] shadow-lg ${isAdmin ? 'bg-rose-500' : isStaff ? 'bg-emerald-500' : 'bg-[#ff7f0e]'
                    }`}>
                    <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                  </div>
                </div>
                <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight mb-1 truncate w-full">{profile?.username}</h2>
                <div className="inline-flex px-2 py-0.5 rounded-full bg-white/10 border border-white/5">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[#ff7f0e]">
                    {profile?.role} Verified
                  </span>
                </div>
              </div>

              {/* Identity Fields */}
              <div className="flex-1 space-y-4 md:space-y-5 w-full">
                <SidebarItem icon={Mail} label="Access Email" value={profile?.email} />

                {isStudent && (
                  <>
                    <SidebarItem icon={IdCard} label="Registration" value={profile?.register_no} />
                    <div className="grid grid-cols-2 gap-3">
                      <SidebarItem icon={GraduationCap} label="Batch" value={profile?.year ? `Y${profile.year}` : '--'} />
                      <SidebarItem icon={Layers} label="Sec" value={profile?.section || '--'} />
                    </div>
                  </>
                )}

                {isStaff && (
                  <SidebarItem icon={IdCard} label="Staff Identification" value={profile?.staff_id || 'ID-ASSIGNED'} />
                )}

                {!isAdmin && (
                  <SidebarItem icon={Building2} label="Department" value={profile?.department} />
                )}

                <SidebarItem icon={History} label="System Start" value={new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
              </div>

              {/* Sidebar Action Button */}
              <div className="pt-6 md:mt-auto shrink-0">
                <Button
                  className="w-full h-10 md:h-11 rounded-lg bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[8px] md:text-[9px] hover:bg-[#ff7f0e] hover:border-[#ff7f0e] hover:text-white transition-all duration-300 shadow-lg"
                  onClick={() => onOpenChange(false)}
                >
                  Exit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT CANVAS: Intelligence Hub */}
          <div className="flex-1 min-w-0 bg-slate-50 flex flex-col p-6 md:p-10 relative md:overflow-hidden h-fit md:h-full">
            {/* Action Bar Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8 w-full relative z-10 shrink-0 pr-12 md:pr-0">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-200/50 shrink-0">
                  <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 text-[#0f2e6e]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-black text-[#0f2e6e] tracking-tight leading-none mb-1">Intelligence Hub</h3>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Live analytical feedback</p>
                </div>
              </div>
            </div>

            {isStudent ? (
              <div ref={progressCardRef} className="flex-1 flex flex-col space-y-4 md:space-y-6 min-h-0 w-full relative z-10 md:overflow-y-auto hide-scrollbar pb-6 md:pb-0">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6 w-full shrink-0">
                  <CompactStat label="Accuracy" value={`${stats.averageScore}%`} icon={Award} />
                  <CompactStat label="Solved Today" value={stats.questionsSolvedToday} icon={Activity} />
                  <CompactStat label="Velocity" value={formatTime(stats.averageTime)} icon={Zap} />
                </div>

                {/* Main Graph Card */}
                <Card className="flex-1 min-h-[320px] md:min-h-[350px] p-4 md:p-8 border-none shadow-[0_20px_50px_rgba(15,46,110,0.05)] rounded-[1.5rem] md:rounded-[2rem] bg-white flex flex-col overflow-hidden w-full relative group">
                  <div className="flex items-center justify-between mb-6 shrink-0">
                    <div>
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em] text-[#0f2e6e]/40 mb-1 leading-none">Weekly Performance Pulse</p>
                      <h4 className="text-[10px] md:text-sm font-black text-[#0f2e6e] tracking-tight">Accuracy Efficiency Distribution</h4>
                    </div>
                    <div className="hidden xs:flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl bg-[#ff7f0e]/5 border border-[#ff7f0e]/10 shrink-0">
                      <Target className="w-3 h-3 md:w-4 md:h-4 text-[#ff7f0e]" />
                      <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-[#0f2e6e]">Analytics</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full min-h-[220px] md:min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <defs>
                          <linearGradient id="visF" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f2e6e" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#0f2e6e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }}
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                          dx={-5}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '0.8rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 900, fontSize: '10px', padding: '10px' }}
                          cursor={{ stroke: '#0f2e6e', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#0f2e6e"
                          strokeWidth={3}
                          fill="url(#visF)"
                          animationDuration={2000}
                          dot={{ r: 3, fill: '#0f2e6e', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 5, strokeWidth: 0, fill: '#ff7f0e' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Achievement Highlight Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full shrink-0">
                  <MiniHighlight icon={Award} title="Max Accuracy" value={`${bestScoreData.score}%`} sub={bestScoreData.date} color="#0f2e6e" />
                  <MiniHighlight icon={Zap} title="Hyper Pace" value={fastestTimeData.time !== Infinity ? `${Math.round(fastestTimeData.time)}s` : '--'} sub={fastestTimeData.date} color="#ff7f0e" />
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 shrink-0 mt-auto">
                  <Button className="flex-[1.5] h-11 md:h-12 rounded-xl bg-[#0f2e6e] hover:bg-[#1a3a7a] text-white font-black uppercase tracking-[0.2em] text-[8px] md:text-[9px] shadow-xl shadow-[#0f2e6e]/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2" onClick={handleGenerateShareLink} disabled={sharingLink}>
                    <Share2 className="w-3.5 h-3.5" /> {sharingLink ? 'Synthesizing...' : 'Record Link'}
                  </Button>
                  <Button variant="outline" className="flex-1 h-11 md:h-12 rounded-xl border-2 border-[#0f2e6e]/10 bg-white hover:bg-[#0f2e6e] hover:text-white transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-[#0f2e6e] text-[8px] md:text-[9px]" onClick={handleDownloadReport}>
                    <Download className="w-3.5 h-3.5 shrink-0" /> <span>Export PNG</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 md:p-12 w-full h-full pb-10">
                <div className="max-w-md w-full text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-white shadow-lg flex items-center justify-center mx-auto mb-6 md:mb-8 border border-slate-100">
                    <ShieldCheck className="w-7 h-7 md:w-9 md:h-9 text-[#0f2e6e]" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-[#0f2e6e] tracking-tighter mb-4 capitalize">{profile?.role} Authorization</h4>
                  <p className="text-xs md:text-base font-medium text-slate-500 leading-relaxed px-2 md:px-6 mb-8">
                    Full oversight validated for {profile?.username}. Intelligence pulse and live tracking are compute-locked for student accounts.
                  </p>
                  <Button
                    className="h-11 px-10 rounded-xl bg-[#0f2e6e] text-white font-black uppercase tracking-[0.2em] text-[9px] items-center gap-3 transition-all duration-300 hover:bg-[#1a3a7a] hover:scale-105 shadow-lg shadow-[#0f2e6e]/20"
                    onClick={() => onOpenChange(false)}
                  >
                    Confirm Oversight <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) {
          .recharts-responsive-container { min-height: 180px; }
        }
      `}</style>
    </Dialog>
  );
}

// Compact UI Components

function SidebarItem({ icon: Icon, label, value }: any) {
  return (
    <div className="w-full">
      <p className="text-[7px] md:text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1 leading-none">{label}</p>
      <div className="flex items-center gap-2.5 md:gap-3 w-full">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/50" />
        </div>
        <span className="text-[10px] md:text-xs font-bold text-white/90 truncate flex-1 min-w-0 tracking-tight">{value || 'N/A'}</span>
      </div>
    </div>
  );
}

function CompactStat({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-md">
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl mb-2 flex items-center justify-center bg-[#0f2e6e]/5 text-[#ff7f0e]">
        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </div>
      <h5 className="text-base md:text-xl font-black tracking-tighter leading-none mb-1 text-[#0f2e6e]">{value}</h5>
      <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

function MiniHighlight({ icon: Icon, title, value, sub, color }: any) {
  const isBlue = color === "#0f2e6e";
  return (
    <div className={`p-4 md:p-5 rounded-xl md:rounded-[1.5rem] flex items-center gap-4 transition-all duration-300 overflow-hidden ${isBlue ? 'bg-[#0f2e6e] text-white shadow-lg shadow-[#0f2e6e]/10 hover:shadow-[#0f2e6e]/20' : 'bg-white border border-slate-200 hover:shadow-md'}`}>
      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${isBlue ? 'bg-white/10' : 'bg-[#ff7f0e]/5 text-[#ff7f0e]'}`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="min-w-0 text-left">
        <p className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest mb-0.5 truncate ${isBlue ? 'opacity-50' : 'text-slate-400'}`}>{title}</p>
        <h4 className={`text-base md:text-lg font-black truncate tracking-tight ${isBlue ? 'text-white' : 'text-[#0f2e6e]'}`}>{value}</h4>
        <p className={`text-[7px] font-bold uppercase tracking-[0.1em] truncate mt-0.5 ${isBlue ? 'opacity-30' : 'text-slate-300'}`}>{sub || 'No Entry'}</p>
      </div>
    </div>
  );
}
