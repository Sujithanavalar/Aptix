import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertCircle,
  Clock,
  FileText,
  Shield,
  ArrowLeft,
  Play,
  AlertTriangle,
  EyeOff,
  MonitorOff
} from 'lucide-react';

export default function TestInstructions() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state;

  if (!config) {
    navigate('/test');
    return null;
  }

  const handleStartTest = () => {
    navigate(`/test/${config.topicSlug}/start`, { state: config });
  };

  const warningItems = [
    {
      icon: <MonitorOff className="h-5 w-5 text-rose-500" />,
      title: "No Other Activities",
      description: "Do not engage in any other activities during the test. Focus solely on the questions."
    },
    {
      icon: <EyeOff className="h-5 w-5 text-rose-500" />,
      title: "No Switching Pages",
      description: "Do not switch browsers, tabs, or applications. Leaving the test page will automatically terminate your session."
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
      title: "Anti-Cheating Detection",
      description: "The system monitors page focus. Clicking outside the test window will cause an immediate termination without saving."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/test/${config.topicSlug}`)}
          className="text-slate-500 hover:text-slate-900 -ml-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Adjust Configuration
        </Button>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
          {/* Header Section */}
          <div className="bg-primary/5 border-b border-primary/10 p-8 text-center">
            <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm mb-4">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Test Instructions</h1>
            <p className="text-slate-500 text-sm mt-1">Review the guidelines carefully before beginning.</p>
          </div>

          <CardContent className="p-6 sm:p-10 space-y-10">

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-center py-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <FileText className="h-4 w-4 text-primary/60 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items</p>
                <p className="text-lg font-bold text-slate-800">{config.questionCount}</p>
              </div>
              <div className="text-center py-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <Shield className="h-4 w-4 text-primary/60 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level</p>
                <p className="text-lg font-bold text-slate-800 capitalize">{config.difficulty}</p>
              </div>
              <div className="text-center py-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <Clock className="h-4 w-4 text-primary/60 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</p>
                <p className="text-lg font-bold text-slate-800">
                  {config.timerEnabled ? `${config.timeLimit / 60}m` : '∞'}
                </p>
              </div>
            </div>

            {/* Warnings Section */}
            <div className="space-y-6">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-1 text-center sm:text-left">
                Strict Compliance Rules
              </h2>
              <div className="space-y-4">
                {warningItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-rose-50 bg-rose-50/20 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-rose-100">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Footer */}
            <div className="py-8 border-t border-slate-100 text-center space-y-3">
              <div className="inline-block px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                System Ready
              </div>
              <h3 className="text-xl font-bold text-slate-900">Ready to demonstrate mastery?</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
                Stay focused, take a deep breath, and do your best. Good luck!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                className="w-full sm:w-1/3 h-14 font-bold border-2 rounded-2xl text-slate-500 hover:bg-slate-50"
                onClick={() => navigate(`/test/${config.topicSlug}`)}
              >
                Go Back
              </Button>
              <Button
                size="lg"
                className="w-full sm:flex-1 h-14 bg-primary text-primary-foreground font-bold text-base rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                onClick={handleStartTest}
              >
                Start Test Now
                <Play className="h-4 w-4 ml-2 fill-current" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}