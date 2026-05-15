import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  User,
  Info,
  Monitor,
  Smartphone,
  MessageSquareHeart,
  LogOut,
  ShieldCheck,
  Users,
  Briefcase,
  Sparkles
} from 'lucide-react';

// CORRECT IMPORTS: Assuming these files are in the same folder (src/components/common/)
import UserProfileModal from './UserProfileModal';
import FeedbackModal from './FeedbackModal';

interface SettingsMenuProps {
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
}

export default function SettingsMenu({ viewMode, onViewModeChange }: SettingsMenuProps) {
  const navigate = useNavigate();
  const { signOut, isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [open, setOpen] = useState(false);

  // Check user role
  const isStaff = profile?.role === 'staff';

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Oops!',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'See you later!',
        description: 'You have signed out successfully.'
      });
      setOpen(false);
      navigate('/');
    }
  };

  const handleViewModeToggle = () => {
    const newMode = viewMode === 'desktop' ? 'mobile' : 'desktop';
    onViewModeChange(newMode);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {/* TRIGGER: Added group for rotation control */}
          <Button variant="ghost" size="icon" className="relative hover:bg-[#0f2e6e]/5 transition-all rounded-xl group">
            <Settings className="h-5 w-5 text-[#0f2e6e] transition-transform duration-500 group-hover:rotate-180" />
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto bg-white/95 backdrop-blur-xl border-l-[#0f2e6e]/10 rounded-l-[2rem] shadow-2xl">
          <SheetHeader className="text-left">
            <div className="bg-[#ff7f0e]/10 w-fit p-3 rounded-2xl mb-2 animate-bounce-slow">
              <Sparkles className="h-6 w-6 text-[#ff7f0e]" />
            </div>
            <SheetTitle className="text-2xl font-black text-[#0f2e6e] tracking-tight">Portal Settings</SheetTitle>
            <SheetDescription className="text-slate-500 font-medium">
              Everything you need to manage your account.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-3">

            {/* --- ADMIN OPTIONS --- */}
            {isAdmin ? (
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff7f0e] ml-1 mb-3">Admin Controls</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 h-14 rounded-2xl bg-[#0f2e6e] text-white hover:bg-[#0f2e6e]/90 shadow-lg shadow-[#0f2e6e]/20 transition-all active:scale-95 group"
                  onClick={() => {
                    navigate('/admin');
                    setOpen(false);
                  }}
                >
                  <ShieldCheck className="h-5 w-5 text-[#ff7f0e] transition-transform group-hover:scale-110" />
                  <span className="font-bold text-[11px] uppercase tracking-widest">Admin Dashboard</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 h-14 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all group"
                  onClick={() => {
                    navigate('/admin#manage-staff');
                    setOpen(false);
                  }}
                >
                  <Briefcase className="h-5 w-5 text-slate-400 transition-transform group-hover:-rotate-12" />
                  <span className="font-bold text-[11px] uppercase tracking-widest text-slate-600">Manage Staff</span>
                </Button>
              </div>
            ) : isStaff ? (
              /* --- STAFF OPTIONS --- */
              <div className="pb-4 border-b border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff7f0e] ml-1 mb-3">Staff Controls</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-4 h-14 rounded-2xl bg-[#0f2e6e] text-white hover:bg-[#0f2e6e]/90 shadow-lg shadow-[#0f2e6e]/20 transition-all active:scale-95 group"
                  onClick={() => {
                    navigate('/admin');
                    setOpen(false);
                  }}
                >
                  <Users className="h-5 w-5 text-[#ff7f0e] transition-transform group-hover:scale-110" />
                  <span className="font-bold text-[11px] uppercase tracking-widest">Staff Dashboard</span>
                </Button>
              </div>
            ) : null}

            {/* --- GENERAL OPTIONS --- */}
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 pt-2">Preferences</p>

            <Button
              variant="ghost"
              className="w-full justify-start gap-4 h-14 rounded-2xl hover:bg-[#0f2e6e]/5 transition-all text-[#0f2e6e] group"
              onClick={() => {
                setShowProfile(true);
                setOpen(false);
              }}
            >
              <div className="p-2 bg-[#0f2e6e]/5 rounded-xl transition-colors group-hover:bg-[#0f2e6e]/10">
                <User className="h-5 w-5 transition-transform group-hover:scale-110" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-widest">My Profile</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-4 h-14 rounded-2xl hover:bg-[#0f2e6e]/5 transition-all text-[#0f2e6e] group"
              onClick={() => {
                navigate('/about');
                setOpen(false);
              }}
            >
              <div className="p-2 bg-[#0f2e6e]/5 rounded-xl transition-colors group-hover:bg-[#0f2e6e]/10">
                <Info className="h-5 w-5 transition-transform group-hover:rotate-12" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-widest">About App</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-4 h-14 rounded-2xl hover:bg-[#0f2e6e]/5 transition-all text-[#0f2e6e] group"
              onClick={handleViewModeToggle}
            >
              <div className="p-2 bg-[#0f2e6e]/5 rounded-xl transition-colors group-hover:bg-[#0f2e6e]/10">
                {viewMode === 'desktop' ?
                  <Smartphone className="h-5 w-5 transition-transform group-hover:scale-110" /> :
                  <Monitor className="h-5 w-5 transition-transform group-hover:scale-110" />
                }
              </div>
              <span className="font-bold text-[11px] uppercase tracking-widest">
                {viewMode === 'desktop' ? 'Mobile View' : 'Desktop View'}
              </span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-4 h-14 rounded-2xl hover:bg-[#ff7f0e]/5 transition-all text-[#ff7f0e] group"
              onClick={() => {
                setShowFeedback(true);
                setOpen(false);
              }}
            >
              <div className="p-2 bg-[#ff7f0e]/5 rounded-xl transition-colors group-hover:bg-[#ff7f0e]/10">
                <MessageSquareHeart className="h-5 w-5 transition-transform group-hover:scale-110" />
              </div>
              <span className="font-bold text-[11px] uppercase tracking-widest">Send Feedback</span>
            </Button>

            <div className="pt-6">
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 h-14 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 group"
                onClick={handleSignOut}
              >
                <div className="p-2 bg-rose-50 rounded-xl transition-colors group-hover:bg-rose-100">
                  <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
                <span className="font-bold text-[11px] uppercase tracking-widest">Sign Out</span>
              </Button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">Aptix Portal v2.1</p>
          </div>
        </SheetContent>
      </Sheet>

      <UserProfileModal open={showProfile} onOpenChange={setShowProfile} />
      <FeedbackModal open={showFeedback} onOpenChange={setShowFeedback} />
    </>
  );
}