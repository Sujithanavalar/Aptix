import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { questionsApi } from '@/db/api';
import type { Question } from '@/types/types';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Send, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestWindow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const config = location.state;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [testTerminated, setTestTerminated] = useState(() => {
    if (!config?.topicId) return false;
    const saved = sessionStorage.getItem(`test_state_${config.topicId}`);
    return saved ? JSON.parse(saved).terminated : false;
  });
  const testTerminatedRef = useRef(testTerminated);

  const [warningCount, setWarningCount] = useState(() => {
    if (!config?.topicId) return 0;
    const saved = sessionStorage.getItem(`test_state_${config.topicId}`);
    return saved ? JSON.parse(saved).warnings : 0;
  });
  const warningCountRef = useRef(warningCount);
  const MAX_WARNINGS = 3;
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<number | null>(null);
  const lastViolationTime = useRef(0);

  // Sync refs and storage
  useEffect(() => {
    testTerminatedRef.current = testTerminated;
    warningCountRef.current = warningCount;
    if (config?.topicId) {
      sessionStorage.setItem(`test_state_${config.topicId}`, JSON.stringify({
        terminated: testTerminated,
        warnings: warningCount
      }));
    }
  }, [testTerminated, warningCount, config?.topicId]);

  useEffect(() => {
    if (!config) {
      navigate('/test');
      return;
    }

    // Initialize session if not exists
    if (!sessionStorage.getItem(`test_state_${config.topicId}`)) {
      sessionStorage.setItem(`test_state_${config.topicId}`, JSON.stringify({
        terminated: false,
        warnings: 0
      }));
    }

    fetchQuestions();

    if (config.timerEnabled) {
      setTimeRemaining(config.timeLimit);
    }

    const handleSecurityViolation = (reason: string) => {
      const now = Date.now();
      if (now - lastViolationTime.current < 2000) return; // Debounce violations
      if (testTerminatedRef.current) return;

      lastViolationTime.current = now;
      warningCountRef.current += 1;
      const newCount = warningCountRef.current;
      setWarningCount(newCount);

      if (newCount >= MAX_WARNINGS) {
        terminateTest(`${reason}. Maximum warnings exceeded.`);
      } else {
        toast({
          title: 'Security Warning',
          description: `${reason}. Warning ${newCount}/${MAX_WARNINGS}. Further violations will terminate the test.`,
          variant: 'destructive'
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !testTerminatedRef.current) {
        handleSecurityViolation('Focus lost: You left the test page');
      }
    };

    const handleBlur = () => {
      if (!testTerminatedRef.current) {
        handleSecurityViolation('Focus lost: You clicked outside the test window');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (config?.timerEnabled && timeRemaining !== null && !testTerminated) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timeRemaining, testTerminated]);

  const fetchQuestions = async () => {
    try {
      const data = await questionsApi.getRandomByTopic(
        config.topicId,
        config.difficulty,
        config.questionCount
      );
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Session Error',
        description: 'Failed to load questions. Please try again.',
        variant: 'destructive'
      });
      navigate('/test');
    } finally {
      setLoading(false);
    }
  };

  const terminateTest = (reason: string) => {
    setTestTerminated(true);
    testTerminatedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    toast({
      title: 'Security Violation',
      description: reason,
      variant: 'destructive'
    });

    setTimeout(() => {
      navigate('/test', { replace: true });
    }, 3000);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleSubmit = (autoSubmit = false) => {
    if (testTerminated) return;

    // Clear session storage on completion
    if (config?.topicId) {
      sessionStorage.removeItem(`test_state_${config.topicId}`);
    }

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    let score = 0;
    const answerDetails = questions.map((q, index) => {
      const selectedAnswer = answers[index];
      const isCorrect = selectedAnswer === q.correct_answer;
      if (isCorrect) score++;
      return {
        question_id: q.id,
        selected_answer: selectedAnswer ?? -1,
        is_correct: isCorrect
      };
    });

    navigate('/test/results', {
      state: {
        config,
        score,
        totalQuestions: questions.length,
        timeSpent,
        answers: answerDetails,
        autoSubmit
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm font-medium text-slate-500">Securing environment...</p>
        </div>
      </div>
    );
  }

  if (testTerminated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <Card className="max-w-md border-none shadow-2xl rounded-3xl">
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Session Voided</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Security protocols were triggered due to focus loss. This attempt has been terminated and results will not be recorded.
              </p>
            </div>
            <div className="pt-4">
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 animate-[progress_3s_linear]" />
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-4 tracking-widest">Redirecting to Library</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">
              {config.topicSlug.replace(/-/g, ' ')}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight">
                  Warning {warningCount}/{MAX_WARNINGS}
                </span>
              </div>
            )}
            {config.timerEnabled && timeRemaining !== null && (
              <div className={`flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-2xl transition-colors ${timeRemaining < 60 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-900 text-white'
                }`}>
                <Clock className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${timeRemaining < 60 ? 'animate-pulse' : ''}`} />
                <span className="text-sm sm:text-base font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>
            )}
            <Button
              size="sm"
              onClick={() => handleSubmit(false)}
              className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-4 sm:px-6 font-bold"
            >
              <Send className="h-3.5 w-3.5 mr-2" />
              <span className="hidden sm:inline">Finish Test</span>
              <span className="sm:hidden">Finish</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Question Area */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-10">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Question Prompt
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                      {currentQuestion.question_text}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentIndex] === index;
                      const label = String.fromCharCode(65 + index); // A, B, C, D

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentIndex, index)}
                          className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${isSelected
                            ? 'border-primary bg-primary/[0.03]'
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                            }`}
                        >
                          <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                            }`}>
                            {label}
                          </div>
                          <span className={`text-sm sm:text-base font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Nav */}
                <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-50">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="rounded-xl text-slate-500 font-bold"
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </Button>

                  <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-slate-50 rounded-full">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                    <span className="text-xs font-bold text-slate-600">{Math.round((answeredCount / questions.length) * 100)}%</span>
                  </div>

                  {currentIndex < questions.length - 1 ? (
                    <Button
                      size="lg"
                      className="rounded-xl px-8 font-bold"
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                    >
                      Next
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => handleSubmit(false)}
                      className="rounded-xl px-8 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                    >
                      Submit Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Navigation */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
              <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Navigator</span>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {answeredCount}/{questions.length} Solved
                </span>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const isCurrent = index === currentIndex;
                    const isAnswered = answers[index] !== undefined;

                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`aspect-square rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center ${isCurrent
                          ? 'border-primary bg-primary text-white shadow-md shadow-primary/20 scale-110 z-10'
                          : isAnswered
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:border-emerald-200'
                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                          }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Current
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ml-2" /> Answered
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200 ml-2" /> Pending
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100 border-dashed">
              <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                <strong>Tip:</strong> You can jump between questions using the navigator. Your progress is saved locally until submission.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}