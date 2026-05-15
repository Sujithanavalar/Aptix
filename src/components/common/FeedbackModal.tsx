import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { feedbackApi } from '@/db/api';
import { Star, Send, MessageSquareHeart, Sparkles } from 'lucide-react';
import { supabase } from '@/db/supabase';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit feedback',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user || session.user.id !== user.id) {
        throw new Error('Not authenticated');
      }
      await feedbackApi.create(user.id, rating, feedback || null);

      toast({
        title: 'Thank You!',
        description: 'Your feedback has been submitted successfully'
      });

      setRating(0);
      setFeedback('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setFeedback('');
    onOpenChange(false);
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5: return { label: '⭐ Excellent!', emoji: '🤩' };
      case 4: return { label: '😊 Great!', emoji: '✨' };
      case 3: return { label: '👍 Good', emoji: '👌' };
      case 2: return { label: '😐 Fair', emoji: '🧐' };
      case 1: return { label: '😞 Needs Improvement', emoji: '🛠️' };
      default: return { label: 'Select your rating', emoji: '👋' };
    }
  };

  const currentStatus = getRatingLabel(hoveredRating || rating);

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) handleReset();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-[#0f2e6e]/10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-24 w-24 text-[#ff7f0e]" />
        </div>

        <DialogHeader className="items-center text-center">
          <div className="bg-[#ff7f0e]/10 p-4 rounded-2xl mb-4 animate-bounce">
            <MessageSquareHeart className="h-8 w-8 text-[#ff7f0e]" />
          </div>
          <DialogTitle className="text-3xl font-black text-[#0f2e6e] tracking-tight">
            Level Us Up!
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium px-4">
            How was your learning session? We're all ears and ready to improve.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          <div className="text-center">
            <div className="text-5xl mb-6 transition-all transform hover:scale-110 duration-300">
              {currentStatus.emoji}
            </div>

            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all hover:scale-125 active:scale-90 relative group"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-10 w-10 transition-all duration-300 ${star <= (hoveredRating || rating)
                      ? 'fill-[#ff7f0e] text-[#ff7f0e] drop-shadow-[0_0_8px_rgba(255,127,14,0.4)]'
                      : 'text-slate-200 fill-transparent hover:text-slate-300'
                      }`}
                  />
                  {star <= (hoveredRating || rating) && (
                    <span className="absolute inset-0 bg-[#ff7f0e]/20 blur-xl rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <p className={`text-center mt-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${rating > 0 ? 'text-[#ff7f0e] opacity-100' : 'text-slate-300 opacity-50'}`}>
              {currentStatus.label}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Tell us something -.-
            </label>
            <Textarea
              placeholder="What could we do better? Found a bug? Need improvement? Write it here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none rounded-[1.5rem] border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-[#0f2e6e]/10 focus:border-[#0f2e6e]/20 transition-all text-sm font-medium p-4"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-100 text-slate-400 hover:bg-slate-50 transition-all"
              onClick={handleReset}
              disabled={submitting}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-[#0f2e6e] text-white shadow-xl shadow-[#0f2e6e]/20 hover:scale-[1.02] active:scale-95 transition-all overflow-hidden relative group"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {submitting ? (
                'Transmitting...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Feedback
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}