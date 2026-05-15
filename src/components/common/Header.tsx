import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useStreak } from '@/hooks/useStreak';
import { Brain, Shield, Zap } from 'lucide-react';
import SettingsMenu from './SettingsMenu';

interface HeaderProps {
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
}

export default function Header({ viewMode, onViewModeChange }: HeaderProps) {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { streak, loading: streakLoading } = useStreak(user?.id);

  const isHotStreak = streak > 1;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 xl:h-20 flex items-center justify-between gap-4">

        {/* SOLID PROFESSIONAL LOGO */}
        {/* SOLID PROFESSIONAL LOGO */}
        <Link to="/home" className="flex items-center gap-3 transition-all hover:opacity-90 group">
          <div className="relative flex-shrink-0">
            {/* Geometric Squircle Container from your reference */}
            <div className="relative h-11 w-11 xl:h-13 xl:w-13 bg-slate-100/80 border border-slate-200 rounded-[1.2rem] flex items-center justify-center shadow-inner group-hover:border-primary/40 transition-all duration-300">
              <Brain className="h-6 w-6 xl:h-7 xl:w-7 text-primary" strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl xl:text-2xl tracking-tighter leading-none font-black flex">
              <span className="text-primary">Apt</span>
              {/* No levitation, just bold italic orange */}
              <span className="text-secondary italic ml-[1px]">
                ix
              </span>
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] xl:text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold hidden sm:block">
                Mastery Platform
              </span>
            </div>
          </div>
        </Link>

        {/* NAVIGATION SECTION */}
        <nav className="flex items-center gap-2 xl:gap-3">
          {isAuthenticated ? (
            <>
              {/* STREAK DISPLAY - Only active if > 1 */}
              {!streakLoading && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${isHotStreak
                  ? 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                  : 'bg-muted/50 border-border'
                  }`}>
                  <div className="relative">
                    {isHotStreak && (
                      <div className="absolute inset-0 bg-orange-500/40 rounded-full blur-md animate-pulse"></div>
                    )}
                    <Zap
                      className={`h-4 w-4 transition-all ${isHotStreak
                        ? 'text-orange-500 fill-orange-500'
                        : 'text-muted-foreground'
                        }`}
                    />
                  </div>
                  <span className={`text-xs xl:text-sm font-black ${isHotStreak ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'
                    }`}>
                    {streak || 0}
                  </span>
                </div>
              )}

              {/* NAV LINKS */}
              <div className="hidden md:flex items-center gap-1 mx-2">
                <Link to="/learn">
                  <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/5 px-4 rounded-lg">
                    Learn
                  </Button>
                </Link>
                <Link to="/test">
                  <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/5 px-4 rounded-lg">
                    Test
                  </Button>
                </Link>
              </div>

              {isAdmin && (
                <Link to="/admin" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-secondary font-bold hover:bg-secondary/10 px-3 rounded-lg border border-transparent hover:border-secondary/20">
                    <Shield className="h-4 w-4 mr-1.5" />
                    Admin
                  </Button>
                </Link>
              )}

              <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block"></div>
              <SettingsMenu viewMode={viewMode} onViewModeChange={onViewModeChange} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-bold text-primary px-4">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md px-5 rounded-lg transition-all active:scale-95">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}