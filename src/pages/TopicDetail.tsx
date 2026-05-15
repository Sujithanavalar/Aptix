import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { topicsApi } from '@/db/api';
import type { Topic } from '@/types/types';
import {
  ArrowLeft,
  Calculator,
  GraduationCap,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  MessageSquareHeart,
  Star,
  Sparkles,
  Zap,
  Coffee,
  Brain
} from 'lucide-react';
import TopicIcon from '@/components/common/TopicIcon';
import AgesChatbot from '@/components/common/AgesChatbot';
import SpeedChatbot from '@/components/common/SpeedChatbot';
import RatioChatbot from '@/components/common/RatioChatbot';
import ArithChatbot from '@/components/common/ArithChatbot';
import SurdsChatbot from '@/components/common/SurdsChatbot';
import BoatsChatbot from '@/components/common/BoatsChatbot';
import PipesChatbot from '@/components/common/PipesChatbot';
import AllegationChatbot from '@/components/common/AllegationChatbot';
import FeedbackModal from '@/components/common/FeedbackModal';

const FALLBACK_CONTENT: Record<string, any> = {
  'pipes-cisterns': {
    introduction:
      'Pipes fill or empty tanks at certain rates. Work done = Rate × Time. Multiple pipes working together: add rates for filling, subtract for emptying.',
    key_concepts: [
      'If pipe fills in n hours, rate = 1/n per hour',
      'Combined rate = Sum of individual rates',
      'Emptying pipe: negative rate',
      'Time to fill = 1 / Combined rate'
    ],
    approaches: [
      {
        name: 'Single Pipe Calculation',
        description: 'Calculate time or rate for one pipe.',
        steps: [
          'If fills in n hours → rate = 1/n per hour',
          'Work done = Rate × Time',
          'Time = Work / Rate'
        ],
        example: {
          problem: 'Pipe A fills tank in 6 hours. What fraction fills in 2 hours?',
          solution_steps: [
            'Rate of pipe A = 1/6 per hour',
            'Time = 2 hours',
            'Work done = (1/6) × 2 = 2/6 = 1/3',
            'Tank is 1/3 full'
          ],
          answer: '1/3 of tank'
        }
      },
      {
        name: 'Multiple Pipes Together',
        description: 'Calculate combined filling/emptying time.',
        steps: [
          'Find rate of each pipe (1/time)',
          'Add rates for filling pipes',
          'Subtract rates for emptying pipes',
          'Time = 1 / Combined rate'
        ],
        example: {
          problem: 'Pipe A fills in 4 hours, Pipe B in 6 hours. Time to fill together?',
          solution_steps: [
            'Rate of A = 1/4 per hour',
            'Rate of B = 1/6 per hour',
            'Combined rate = 1/4 + 1/6 = 3/12 + 2/12 = 5/12',
            'Time = 1 / (5/12) = 12/5 = 2.4 hours'
          ],
          answer: '2.4 hours (2 hours 24 minutes)'
        }
      },
      {
        name: 'Filling and Emptying Together',
        description: 'Handle pipes that fill and empty simultaneously.',
        steps: [
          'Calculate filling rate (positive)',
          'Calculate emptying rate (negative)',
          'Net rate = Filling rate - Emptying rate',
          'Time = 1 / Net rate'
        ],
        example: {
          problem:
            'Pipe fills in 3 hours, drain empties in 5 hours. Time to fill with both open?',
          solution_steps: [
            'Filling rate = 1/3 per hour',
            'Emptying rate = 1/5 per hour',
            'Net rate = 1/3 - 1/5 = 5/15 - 3/15 = 2/15',
            'Time = 1 / (2/15) = 15/2 = 7.5 hours'
          ],
          answer: '7.5 hours'
        }
      }
    ],
    key_formulas: [
      'Rate = 1 / Time to complete',
      'Combined rate = Rate₁ + Rate₂ + ...',
      'Time together = 1 / Combined rate',
      'Emptying: subtract rate'
    ]
  }
};

const FALLBACK_VIDEO_URLS: Record<string, string> = {
  'pipes-cisterns': 'https://www.youtube.com/embed/j6vo6d6H6Ho'
};

export default function TopicDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [openApproaches, setOpenApproaches] = useState<number[]>([]);
  const [videoOpen, setVideoOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const TITLE_STYLE = "text-slate-800 font-bold tracking-tight";

  const getStandardYoutubeUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('/embed/')) {
      const videoId = url.split('/embed/')[1].split('?')[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return url;
  };

  useEffect(() => {
    if (slug) fetchTopic();
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  const fetchTopic = async () => {
    if (!slug) return;
    try {
      const data = await topicsApi.getBySlug(slug);
      if (!data) {
        setTopic(null);
        return;
      }
      const rawContent: any = (data as any).content;
      let parsedContent: any = rawContent;
      if (typeof rawContent === 'string') {
        try {
          parsedContent = JSON.parse(rawContent);
        } catch {
          parsedContent = {};
        }
      }
      const normalizedContent = {
        introduction: parsedContent?.introduction ?? '',
        key_concepts: Array.isArray(parsedContent?.key_concepts) ? parsedContent.key_concepts : [],
        approaches: Array.isArray(parsedContent?.approaches) ? parsedContent.approaches : [],
        common_mistakes: Array.isArray(parsedContent?.common_mistakes) ? parsedContent.common_mistakes : [],
        key_formulas: Array.isArray(parsedContent?.key_formulas) ? parsedContent.key_formulas : [],
        practice_tips: Array.isArray(parsedContent?.practice_tips) ? parsedContent.practice_tips : []
      };
      const isEmpty =
        (!normalizedContent.introduction || normalizedContent.introduction.trim().length === 0) &&
        normalizedContent.key_concepts.length === 0 &&
        normalizedContent.approaches.length === 0;

      const fallbackContent = slug && FALLBACK_CONTENT[slug] ? FALLBACK_CONTENT[slug] : null;
      const finalContent = isEmpty && fallbackContent ? fallbackContent : normalizedContent;
      const finalVideoUrl =
        (data as any).video_url || (slug && FALLBACK_VIDEO_URLS[slug]) || undefined;
      setTopic({ ...(data as Topic), video_url: finalVideoUrl, content: finalContent });
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproach = (index: number) => {
    setOpenApproaches(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[#f4f7fa]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#0f2e6e] border-r-4 border-r-transparent shadow-xl" />
          <p className="mt-6 text-[#0f2e6e] font-black uppercase text-[10px] tracking-[0.3em] animate-pulse text-center">Unlocking Knowledge...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-[#f4f7fa]">
        <div className="text-center p-12 rounded-[3rem] bg-white shadow-2xl border border-[#0f2e6e]/5">
          <div className="bg-[#ff7f0e]/10 p-6 rounded-full w-fit mx-auto mb-6">
            <Coffee className="h-12 w-12 text-[#ff7f0e]" />
          </div>
          <p className="text-xl font-black text-[#0f2e6e] mb-6">Oops! This topic took a detour.</p>
          <Button onClick={() => navigate('/learn')} className="rounded-2xl bg-[#0f2e6e] px-10 h-12 font-bold uppercase text-xs tracking-widest shadow-lg hover:scale-105 transition-transform">
            Go back to Base
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f4f7fa] py-10 selection:bg-[#ff7f0e]/30 relative overflow-hidden">
      {/* Playful Background Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#0f2e6e]/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#ff7f0e]/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/learn')}
          className="mb-10 text-slate-400 hover:text-[#0f2e6e] hover:bg-white/50 backdrop-blur-sm font-black text-[10px] uppercase tracking-[0.3em] transition-all group pl-3 rounded-full border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform" />
          Dashboard Inventory
        </Button>

        {/* Header Section */}
        <div className="mb-14">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 text-center md:text-left">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f2e6e] to-[#ff7f0e] rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
              <div className="relative p-6 bg-white shadow-2xl rounded-[2.5rem] border border-white transform transition-transform group-hover:rotate-3">
                <TopicIcon iconName={topic.icon} className="h-12 w-12 text-[#0f2e6e]" />
              </div>
            </div>
            <div className="pt-2">
              <h1 className={`text-4xl md:text-5xl ${TITLE_STYLE} leading-[1.1] mb-3 drop-shadow-sm`}>
                {topic.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="h-1 w-8 bg-[#ff7f0e] rounded-full" />
                <p className="text-[#ff7f0e] text-[10px] font-black uppercase tracking-[0.2em]">{topic.definition}</p>
              </div>
            </div>
          </div>

          {topic.content.introduction && (
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl border border-white/50">
              <CardContent className="p-8 md:p-10 relative">
                <Sparkles className="absolute top-4 right-4 h-5 w-5 text-[#ff7f0e]/30 animate-spin-slow" />
                <p className="text-slate-600 leading-relaxed font-bold italic text-base md:text-lg">
                  "{topic.content.introduction}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Video Section */}
        {topic.video_url && (
          <div className="mb-14">
            <Collapsible open={videoOpen} onOpenChange={setVideoOpen}>
              <Card className="overflow-hidden border-none bg-white shadow-xl rounded-[2.5rem]">
                <CollapsibleTrigger className="w-full">
                  <div className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-[#ff7f0e]/10 rounded-2xl shadow-inner">
                        <PlayCircle className="h-6 w-6 text-[#ff7f0e]" />
                      </div>
                      <span className={`text-xl ${TITLE_STYLE}`}>Mission Briefing</span>
                    </div>
                    {/* FIXED DROPDOWN ICON VISIBILITY */}
                    <div className={`p-2 rounded-xl transition-all duration-300 ${videoOpen ? 'bg-[#ff7f0e] text-white' : 'bg-[#0f2e6e] text-white shadow-lg'}`}>
                      {videoOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-2">
                    <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={topic.video_url}
                        title={`${topic.name} Tutorial`}
                        allowFullScreen
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-[2.5rem]">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[#ff7f0e]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stream powered by Feel Free to Learn</span>
                    </div>
                    <a
                      href={getStandardYoutubeUrl(topic.video_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#0f2e6e] hover:bg-[#0f2e6e] hover:text-white font-black uppercase tracking-widest flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95"
                    >
                      Full Access <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        )}

        {/* Core Concepts */}
        {topic.content.key_concepts && topic.content.key_concepts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 bg-[#0f2e6e] rounded-xl shadow-lg shadow-[#0f2e6e]/20 animate-bounce-slow">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h2 className={`text-sm font-black ${TITLE_STYLE} uppercase tracking-[0.3em]`}>The Fundamentals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.content.key_concepts.map((concept, index) => (
                <div key={index} className="flex gap-5 p-6 bg-white border-2 border-transparent hover:border-[#0f2e6e]/10 rounded-[2.2rem] shadow-sm transition-all group hover:-translate-y-1">
                  <div className="h-8 w-8 rounded-full bg-[#0f2e6e]/5 flex items-center justify-center flex-shrink-0 text-[#0f2e6e] text-[10px] font-black group-hover:bg-[#0f2e6e] group-hover:text-white transition-colors">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed pt-1">{concept}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Methods */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2.5 bg-[#ff7f0e] rounded-xl shadow-lg shadow-[#ff7f0e]/20 animate-pulse">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h2 className={`text-sm font-black ${TITLE_STYLE} uppercase tracking-[0.3em]`}>Solving Protocols</h2>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 ml-14">Master the logic, step by step.</p>

          <div className="space-y-6">
            {topic.content.approaches.map((approach, index) => {
              const isOpen = openApproaches.includes(index);
              return (
                <Collapsible key={index} open={isOpen} onOpenChange={() => toggleApproach(index)}>
                  <Card className={`overflow-hidden border-2 transition-all duration-500 rounded-[2.5rem] ${isOpen ? 'border-[#0f2e6e]/20 shadow-2xl scale-[1.02]' : 'border-transparent bg-white shadow-md'}`}>
                    <CollapsibleTrigger className="w-full">
                      <div className={`p-6 md:p-8 flex items-center justify-between gap-4 transition-colors ${isOpen ? 'bg-[#0f2e6e]/5' : 'bg-white hover:bg-slate-50/50'}`}>
                        <div className="flex items-center gap-6">
                          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-xs transition-all ${isOpen ? 'bg-[#0f2e6e] text-white rotate-12' : 'bg-slate-100 text-slate-400'}`}>
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <h3 className={`text-lg ${TITLE_STYLE}`}>{approach.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{approach.description}</p>
                          </div>
                        </div>
                        {/* FIXED DROPDOWN ICON VISIBILITY */}
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-[#ff7f0e] text-white shadow-lg' : 'bg-slate-100 text-slate-400 shadow-inner'}`}>
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="p-8 md:p-10 space-y-10 bg-white border-t border-slate-100">
                        {approach.steps && approach.steps.length > 0 && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 text-[#ff7f0e] font-black text-[10px] uppercase tracking-[0.3em]">
                              <GraduationCap className="h-4 w-4" /> Mechanism
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {approach.steps.map((step, sIdx) => (
                                <div key={sIdx} className="flex gap-5 p-5 bg-slate-50 rounded-[1.8rem] border border-slate-200/50 transition-colors hover:bg-white hover:border-[#0f2e6e]/10">
                                  <span className="text-[#0f2e6e] font-black text-xs">{sIdx + 1}.</span>
                                  <span className="text-sm font-bold text-slate-600 leading-relaxed">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {approach.example && (
                          <div className="rounded-[2.5rem] border-2 border-dashed border-[#ff7f0e]/20 bg-[#ff7f0e]/5 overflow-hidden">
                            <div className="p-6 bg-white/50 border-b border-[#ff7f0e]/10 flex items-center gap-3">
                              <Calculator className="h-4 w-4 text-[#ff7f0e]" />
                              <span className="text-[10px] uppercase font-black text-[#ff7f0e] tracking-[0.3em]">Practical Scenario</span>
                            </div>

                            <div className="p-8 md:p-10 space-y-8">
                              <div className="bg-[#0f2e6e] p-6 md:p-8 rounded-[2rem] shadow-2xl relative transform transition-transform hover:scale-[1.01]">
                                <Sparkles className="absolute top-4 right-4 h-4 w-4 text-[#ff7f0e]/50 animate-pulse" />
                                <span className="text-[9px] font-black text-[#ff7f0e] uppercase block mb-3 tracking-[0.2em]">The Challenge</span>
                                <p className={`font-bold text-base md:text-lg text-white leading-relaxed`}>{approach.example.problem}</p>
                              </div>

                              <div className="space-y-4 px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Solving Log</span>
                                <div className="space-y-3">
                                  {approach.example.solution_steps.map((step, sIdx) => (
                                    <div key={sIdx} className="flex gap-4 text-sm font-bold text-slate-500 items-start">
                                      <div className="h-1.5 w-1.5 rounded-full bg-[#ff7f0e] mt-2 shrink-0 opacity-40 animate-pulse" />
                                      <p>{step}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-6 bg-white rounded-3xl border-2 border-[#ff7f0e]/20 flex items-center justify-between shadow-xl ring-8 ring-[#ff7f0e]/5">
                                <span className="text-[10px] font-black text-[#ff7f0e] uppercase tracking-[0.2em]">Final Answer</span>
                                <span className="text-xl font-black text-[#0f2e6e] tracking-tight">{approach.example.answer}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </div>

        {/* Logic Gaps / Mistakes */}
        {topic.content.common_mistakes && topic.content.common_mistakes.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 bg-rose-500 rounded-xl shadow-lg shadow-rose-500/20 animate-bounce-slow">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <h2 className={`text-sm font-black ${TITLE_STYLE} uppercase tracking-[0.3em]`}>Common Pitfalls</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {topic.content.common_mistakes.map((mistake, index) => (
                <div key={index} className="flex items-center gap-5 p-5 bg-white border border-rose-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-2 bg-rose-50 rounded-full group-hover:scale-110 transition-transform">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                  </div>
                  <p className="text-xs font-bold text-rose-900/70 leading-relaxed">{mistake}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulas */}
        {topic.content.key_formulas && topic.content.key_formulas.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2.5 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 animate-pulse">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <h2 className={`text-sm font-black ${TITLE_STYLE} uppercase tracking-[0.3em]`}>Cheat Sheet</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {topic.content.key_formulas.map((formula, index) => (
                <div key={index} className="p-7 bg-white rounded-[2rem] border border-slate-100 font-mono text-sm md:text-base text-[#0f2e6e] font-black shadow-sm group hover:border-[#ff7f0e]/30 transition-all flex items-center gap-5">
                  <div className="h-6 w-6 bg-[#ff7f0e]/10 rounded-lg flex items-center justify-center text-[#ff7f0e] font-black text-[10px]">#</div>
                  {formula}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FEEDBACK SECTION --- */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-[#0f2e6e] to-[#1a3a7e] p-10 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-[#ff7f0e]/20 rounded-full blur-[80px] transition-transform duration-1000 group-hover:scale-150" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="p-6 bg-white/10 rounded-[2.5rem] backdrop-blur-2xl border border-white/20 shadow-inner group-hover:rotate-6 transition-transform">
                <MessageSquareHeart className="h-12 w-12 text-[#ff7f0e]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">How's the learning vibe?</h3>
                <p className="text-blue-100/60 text-sm font-bold mb-8">
                  Your thoughts help us sharpen these modules. Level us up with your rating!
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-5 w-5 text-white/20 fill-current" />
                    ))}
                  </div>
                  <Button
                    onClick={() => setFeedbackOpen(true)}
                    className="bg-white hover:bg-[#ff7f0e] text-[#0f2e6e] hover:text-white font-black uppercase text-[10px] tracking-[0.3em] px-10 h-14 rounded-2xl shadow-2xl transition-all active:scale-95 border-none"
                  >
                    Rate Module
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-14 opacity-50" />

        {/* Final Action Section */}
        <div className="py-14 px-10 rounded-[3.5rem] bg-[#0f2e6e] text-center shadow-2xl relative overflow-hidden group mb-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff7f0e]/10 rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-20 -mb-20" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-5 bg-white/10 rounded-[2rem] mb-8 shadow-inner group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-10 w-10 text-[#ff7f0e]" />
            </div>
            <h3 className={`text-3xl md:text-4xl font-black text-white tracking-tighter mb-4`}>Logic Verified?</h3>
            <p className="text-blue-100/50 font-black uppercase text-[10px] tracking-[0.4em] mb-12">
              Time to apply theory to <span className="text-[#ff7f0e] italic">{topic.name}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(`/practice/${topic.slug}`)}
                className="bg-[#ff7f0e] hover:bg-[#e6720d] text-white px-12 h-16 rounded-[1.8rem] font-black uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all"
              >
                Practice Lab
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(`/test/${topic.slug}`)}
                className="bg-white border-none text-[#0f2e6e] hover:bg-slate-100 px-12 h-16 rounded-[1.8rem] font-black uppercase text-[11px] tracking-widest shadow-2xl active:scale-95 transition-all"
              >
                Launch Test <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* AI Assistant Ready Label */}
        <div className="mt-20 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] shadow-sm animate-pulse">AI Assistant Ready</div>
          {slug === 'ages' && <AgesChatbot />}
          {(slug === 'speed-time-distance' || slug === 'speed') && <SpeedChatbot />}
          {(slug === 'ratio-proportion' || slug === 'ratio-and-proportion') && <RatioChatbot />}
          {(slug === 'arithmetic-progression' || slug === 'arithmetic') && <ArithChatbot />}
          {slug === 'surds-indices' && <SurdsChatbot />}
          {slug === 'boats-streams' && <BoatsChatbot />}
          {slug === 'pipes-cisterns' && <PipesChatbot />}
          {(slug === 'allegation-mixtures' || slug === 'allegation') && <AllegationChatbot />}
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}