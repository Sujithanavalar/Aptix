import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain,
  Target,
  Users,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Activity,
  Code2,
  Rocket,
  Lightbulb
} from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  // Helper for staggered animation appearance
  const fadeInClass = "animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forward";

  return (
    <div className="min-h-screen bg-[#f4f7fa] relative overflow-x-hidden font-sans selection:bg-[#0f2e6e]/10 selection:text-[#0f2e6e]">

      {/* Dynamic Background Decorative Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#0f2e6e]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff7f0e]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 md:px-8 max-w-5xl py-12">

        {/* Navigation - Playful Style */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-12 text-slate-400 hover:text-[#0f2e6e] hover:bg-white/50 backdrop-blur-sm font-black text-[10px] uppercase tracking-[0.3em] transition-all group pl-3 rounded-full border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Base
        </Button>

        {/* Hero Section - High Resolution Aesthetic */}
        <div className={`text-center mb-24 ${fadeInClass}`}>
          <div className="flex justify-center mb-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f2e6e] to-[#ff7f0e] rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
              <div className="relative p-8 bg-white shadow-2xl rounded-[2.5rem] border border-white transform transition-transform group-hover:scale-105 duration-500">
                <Brain className="h-16 w-16 text-[#0f2e6e] animate-bounce-slow" />
              </div>
              <Sparkles className="absolute -top-3 -right-3 h-10 w-10 text-[#ff7f0e] animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.9] text-[#0f2e6e]">
            Aptix <span className="text-[#ff7f0e] italic underline decoration-[#ff7f0e]/10 underline-offset-8">Ecosystem.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-bold italic opacity-80">
            "Transforming cognitive potential into professional mastery through precision engineering and logical intuition."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          {/* Mission - Playful Detailed Card */}
          <Card className={`md:col-span-7 border-none shadow-[0_30px_60px_-15px_rgba(15,46,110,0.1)] bg-white/70 backdrop-blur-xl rounded-[3rem] overflow-hidden ${fadeInClass} [animation-delay:100ms]`}>
            <CardContent className="p-10 md:p-12 relative">
              <div className="absolute top-6 right-6 opacity-10">
                <Rocket className="h-20 w-20 text-[#0f2e6e]" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[#0f2e6e] rounded-2xl shadow-lg shadow-[#0f2e6e]/20">
                  <Target className="h-6 w-6 text-[#ff7f0e]" />
                </div>
                <h2 className="text-2xl font-black text-[#0f2e6e] tracking-tight uppercase text-sm tracking-[0.2em]">The Mission</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed font-bold">
                Aptitude isn't just about speed—it's about the <span className="text-[#0f2e6e] underline decoration-[#ff7f0e]/30 underline-offset-4">elegance of logic.</span>
              </p>
              <p className="text-slate-500 text-base leading-relaxed mt-4 font-medium opacity-90">
                Aptix provides a systematic modular framework designed to help modern learners dismantle complex quantitative challenges. We bridge the gap between academic theory and corporate problem-solving requirements.
              </p>
            </CardContent>
          </Card>

          {/* Quick Highlights - Solid Brand Card */}
          <Card className={`md:col-span-5 border-none shadow-2xl bg-[#0f2e6e] rounded-[3rem] text-white relative overflow-hidden ${fadeInClass} [animation-delay:200ms] group`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            <CardContent className="p-10 flex flex-col justify-center h-full space-y-10 relative z-10">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <TrendingUp className="h-7 w-7 text-[#ff7f0e]" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">Metric Driven</h4>
                  <p className="text-blue-100/50 text-[10px] font-black uppercase tracking-widest">Real-time analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <ShieldCheck className="h-7 w-7 text-[#ff7f0e]" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">Anti-Friction</h4>
                  <p className="text-blue-100/50 text-[10px] font-black uppercase tracking-widest">Deep Focus Detection</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Activity className="h-7 w-7 text-[#ff7f0e]" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">Adaptive</h4>
                  <p className="text-blue-100/50 text-[10px] font-black uppercase tracking-widest">Dynamic Difficulty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Playful Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: <Zap className="h-6 w-6" />,
              title: "Instant Verification",
              desc: "Immediate theoretical feedback after every interaction to patch logic gaps instantly.",
              color: "text-[#ff7f0e]",
              bg: "bg-[#ff7f0e]/10"
            },
            {
              icon: <Lightbulb className="h-6 w-6" />,
              title: "Cognitive Paths",
              desc: "Concepts dismantled through modular steps and visual illustrations for total retention.",
              color: "text-[#0f2e6e]",
              bg: "bg-[#0f2e6e]/5"
            },
            {
              icon: <Users className="h-6 w-6" />,
              title: "Unified Sync",
              desc: "A seamless transition between desktop mastery and mobile practice logs.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10"
            }
          ].map((feature, i) => (
            <Card key={i} className={`border-none shadow-xl bg-white rounded-[2.5rem] hover:-translate-y-2 transition-all duration-500 ${fadeInClass}`} style={{ animationDelay: `${300 + (i * 100)}ms` }}>
              <CardContent className="p-8">
                <div className={`p-4 rounded-[1.5rem] w-fit mb-6 ${feature.bg} ${feature.color} shadow-inner`}>
                  {feature.icon}
                </div>
                <h4 className="text-lg font-black text-[#0f2e6e] mb-3 tracking-tight uppercase text-xs tracking-[0.2em]">{feature.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-bold opacity-80">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inventory Coverage - Detailed List */}
        <Card className={`border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] bg-white/50 backdrop-blur-2xl rounded-[3.5rem] overflow-hidden border border-white ${fadeInClass} [animation-delay:600ms] group`}>
          <CardContent className="p-10 md:p-14 relative">
            <div className="absolute -bottom-10 -left-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <Brain className="h-64 w-64 text-[#0f2e6e]" />
            </div>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4 px-5 py-2 rounded-full bg-[#ff7f0e]/10 border border-[#ff7f0e]/20 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-[#ff7f0e]" />
                <span className="text-[10px] font-black text-[#ff7f0e] uppercase tracking-[0.3em]">Theoretical Inventory</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-[#0f2e6e] tracking-tighter">
                Comprehensive Syllabus coverage.
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {[
                'Ages', 'Speed & Distance', 'Ratio & Proportion',
                'Arithmetic', 'Surds & Indices', 'Boats & Streams',
                'Pipes & Cisterns', 'Mixtures'
              ].map((topic) => (
                <div
                  key={topic}
                  className="group p-5 bg-white border border-slate-100 rounded-[1.5rem] text-center hover:border-[#0f2e6e]/20 hover:shadow-xl hover:shadow-[#0f2e6e]/5 transition-all duration-300 cursor-default"
                >
                  <span className="text-xs font-black text-slate-400 group-hover:text-[#0f2e6e] uppercase tracking-widest transition-colors">
                    {topic}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Playful CTA Footer */}
        <div className={`text-center mt-24 pb-12 ${fadeInClass} [animation-delay:700ms]`}>
          <div className="mb-10 flex flex-col items-center gap-4">
            <div className="h-1.5 w-16 bg-[#ff7f0e] rounded-full" />
            <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">
              Join thousands of students optimizing their analytical precision today.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="h-16 px-12 bg-[#0f2e6e] hover:bg-[#0f2e6e]/95 text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-[#0f2e6e]/30 hover:scale-[1.05] active:scale-95 transition-all group"
          >
            Start Evolution
            <ArrowLeft className="h-4 w-4 ml-3 rotate-180 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Footer Branding */}
        <footer className="mt-10 pt-10 border-t border-slate-200 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0f2e6e] rounded-2xl shadow-lg shadow-[#0f2e6e]/10">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Architecture By</p>
              <p className="text-sm font-black text-[#0f2e6e] tracking-tight">Varsha R G <span className="text-[#ff7f0e]">&</span> Sujitha N</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">CSE Department • Aptix Portal v2.1</p>
        </footer>
      </div>
    </div>
  );
}