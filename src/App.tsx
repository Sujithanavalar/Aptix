import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import routes from './routes';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { supabase } from '@/db/supabase';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const NavigationTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const historyStack = JSON.parse(sessionStorage.getItem('historyStack') || '[]');
    const currentPath = location.pathname;
    const previousPath = historyStack[historyStack.length - 1];

    // Determine if this is a back navigation
    const isBackNavigation = historyStack.includes(currentPath) && previousPath !== currentPath;

    if (isBackNavigation) {
      // Remove from stack (going back)
      const newStack = historyStack.slice(0, historyStack.indexOf(currentPath) + 1);
      sessionStorage.setItem('historyStack', JSON.stringify(newStack));
      sessionStorage.setItem('navDirection', 'back');
    } else {
      // Add to stack (going forward)
      historyStack.push(currentPath);
      sessionStorage.setItem('historyStack', JSON.stringify(historyStack));
      sessionStorage.setItem('navDirection', 'forward');
    }
  }, [location.pathname]);

  return null;
};

const AuthEventHandler: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/update-password', { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return null;
};

const ProtectedRoute: React.FC<{
  element: React.ReactNode;
  requiresAuth?: boolean;
  adminOnly?: boolean;
  allowedRoles?: string[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  userRole?: string;
  hasSetupPassword?: boolean;
}> = ({ element, requiresAuth, adminOnly, allowedRoles, isAuthenticated, isAdmin, loading, userRole, hasSetupPassword }) => {

  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f2e6e]" />
      </div>
    );
  }

  // 1. STRICT PASSWORD SETUP GUARD
  // If user is logged in, but we can't confirm they've setup their password (false or undefined)
  // and they aren't on the setup page, kick them to setup.
  if (isAuthenticated && hasSetupPassword !== true && location.pathname !== '/setup-password') {
    return <Navigate to="/setup-password" replace />;
  }

  // 2. Prevent accessing setup page if already done
  if (isAuthenticated && hasSetupPassword === true && location.pathname === '/setup-password') {
    return <Navigate to="/home" replace />;
  }

  // 3. Normal Auth Redirects
  if (!requiresAuth && !adminOnly && isAuthenticated &&
    (location.pathname === '/' || location.pathname === '/register')) {
    return <Navigate to="/home" replace />;
  }

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 4. Role Guards
  if (adminOnly && !isAdmin) return <Navigate to="/home" replace />;
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) return <Navigate to="/home" replace />;

  return <>{element}</>;
};

const App: React.FC = () => {
  const { isAuthenticated, loading, isAdmin, profile } = useAuth();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(() => {
    const saved = localStorage.getItem('viewMode');
    return (saved as 'desktop' | 'mobile') || 'desktop';
  });

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
    if (viewMode === 'mobile') {
      document.documentElement.classList.add('mobile-mode');
    } else {
      document.documentElement.classList.remove('mobile-mode');
    }
  }, [viewMode]);

  return (
    <Router>
      <ScrollToTop />
      <NavigationTracker />
      <AuthEventHandler />

      <LayoutWrapper viewMode={viewMode} setViewMode={setViewMode}>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute
                  element={route.element}
                  requiresAuth={route.requiresAuth}
                  adminOnly={route.adminOnly}
                  allowedRoles={route.allowedRoles}
                  isAuthenticated={isAuthenticated}
                  isAdmin={isAdmin}
                  loading={loading}
                  userRole={profile?.role}
                  hasSetupPassword={profile?.has_setup_password}
                />
              }
            />
          ))}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />}
          />
        </Routes>
      </LayoutWrapper>
      <Toaster />
    </Router>
  );
};

const LayoutWrapper: React.FC<{
  children: React.ReactNode,
  viewMode: 'desktop' | 'mobile',
  setViewMode: (v: 'desktop' | 'mobile') => void
}> = ({ children, viewMode, setViewMode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const hideLayout = ['/', '/register', '/update-password', '/setup-password'].includes(location.pathname);

  const [animationClass, setAnimationClass] = useState('animate-fade-in');

  useEffect(() => {
    const navDirection = sessionStorage.getItem('navDirection') || 'forward';
    setAnimationClass(navDirection === 'back' ? 'animate-slide-back' : 'animate-fade-in');
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {!loading && isAuthenticated && !hideLayout && (
        <Header viewMode={viewMode} onViewModeChange={setViewMode} />
      )}
      <main className={`flex-grow ${animationClass}`}>
        {children}
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
};

export default App;
