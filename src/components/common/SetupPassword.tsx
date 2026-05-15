import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import { ShieldCheck, ArrowRight, Lock, Loader2, ArrowLeft } from 'lucide-react';

export default function SetupPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation Checks
    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    if (password === "aptix123") {
      toast({ title: "Invalid Password", description: "You cannot use the common password as your private password.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 2. Update the password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: password
      });

      if (authError) throw authError;

      // 3. Get the current user session
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 4. Update the profile flag AND ensure the ID is linked
        // We use the email to ensure we hit the right record even if ID was previously null
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({
            has_setup_password: true,
            id: user.id // Ensure ID is synced
          })
          .eq('email', user.email)
          .select('role')
          .single();

        if (profileError) throw profileError;

        toast({
          title: "Account Activated",
          description: "Your private password is set. Welcome to the portal!"
        });

        // 5. Hard Redirect to Refresh All Hooks (Streaks, Stats, etc.)
        // A simple navigate('/home') sometimes keeps old stale state.
        // Doing a window.location change ensures the useAuth hook pulls fresh data.
        const targetPath = (profileData?.role === 'admin' || profileData?.role === 'staff') ? '/admin' : '/home';
        window.location.href = targetPath;
      }

    } catch (error: any) {
      toast({ title: "Setup Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    // Clear local session storage first
    sessionStorage.clear();
    localStorage.clear();

    // Attempt to sign out (ignore errors since session might be invalid)
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      // Ignore 403 or any other errors - we're clearing locally anyway
      console.log('Logout API call failed (expected if session invalid):', error);
    }

    // Force redirect regardless of API response
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa] px-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0f2e6e]/5 rounded-full blur-[100px]" />

      <Card className="w-full max-w-md border-none shadow-[0_40px_100px_-20px_rgba(15,46,110,0.1)] rounded-[2.5rem] bg-white/80 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto w-16 h-16 bg-[#0f2e6e] rounded-[1.2rem] flex items-center justify-center mb-6 shadow-lg shadow-[#0f2e6e]/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-black text-[#0f2e6e]">Set Private Password</CardTitle>
          <CardDescription className="font-medium text-slate-500 mt-2 px-6">
            Replace the common password with a private one to activate your portal access.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-10">
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#0f2e6e]" />
                <Input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 pl-12 rounded-2xl bg-slate-100/50 border-2 border-transparent focus:border-[#0f2e6e]/10 focus:bg-white font-bold transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#0f2e6e]" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-14 pl-12 rounded-2xl bg-slate-100/50 border-2 border-transparent focus:border-[#0f2e6e]/10 focus:bg-white font-bold transition-all"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl bg-[#0f2e6e] hover:bg-[#0f2e6e]/90 text-white font-black uppercase tracking-[0.2em] text-[11px] mt-4 shadow-xl shadow-[#0f2e6e]/10 transition-all" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
                <span className="flex items-center justify-center gap-2">
                  Activate &amp; Enter <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Back Button */}
          <div className="mt-6">
            <Button
              type="button"
              onClick={handleBack}
              variant="ghost"
              className="w-full h-12 rounded-2xl text-slate-600 hover:text-[#0f2e6e] hover:bg-slate-100/50 font-bold text-sm transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
              Security Protocol: Mandatory for first-time login
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}