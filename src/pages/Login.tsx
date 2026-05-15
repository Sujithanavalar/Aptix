import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import {
  Brain,
  Mail,
  Lock,
  ChevronDown,
  UserCircle,
  Loader2,
  Fingerprint,
  Code2,
  ArrowRight,
  BookOpen,
  Sparkles,
  Lightbulb
} from 'lucide-react';

export default function Login() {
  const COMMON_PASSWORD = "aptix123";
  const navigate = useNavigate();
  const { toast } = useToast();
  const PRIMARY_BLUE = "#0f2e6e";

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user' as 'user' | 'staff' | 'admin',
    username: '',
    register_no: '',
    department: '',
    year: '',
    section: ''
  });

  const [loading, setLoading] = useState(false);
  const [isCorrectPassword, setIsCorrectPassword] = useState(false);
  const [dbProfile, setDbProfile] = useState<any>(null);

  const isEmailValid = formData.email.includes('@') && formData.email.includes('.');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const validateAccess = async () => {
      if (!isEmailValid || formData.password.length < 4) {
        setIsCorrectPassword(false);
        setDbProfile(null);
        return;
      }

      try {
        const emailClean = formData.email.trim().toLowerCase();

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', emailClean)
          .maybeSingle();

        if (profile) {
          setDbProfile(profile);
          setFormData(prev => ({
            ...prev,
            username: profile.username || '',
            department: profile.department || '',
            year: profile.year || '',
            section: profile.section || '',
            register_no: profile.register_no || ''
          }));

          if (formData.password === COMMON_PASSWORD) {
            setIsCorrectPassword(true);
          }
        } else {
          setDbProfile(null);
          setIsCorrectPassword(false);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    timer = setTimeout(validateAccess, 500);
    return () => clearTimeout(timer);
  }, [formData.email, formData.password, isEmailValid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailClean = formData.email.trim().toLowerCase();

      if (!dbProfile) {
        throw new Error("No record found for this email. Please contact Admin.");
      }

      if (dbProfile.role !== formData.role) {
        throw new Error(`This account is registered as ${dbProfile.role}.`);
      }

      // 1. Attempt Login
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailClean,
        password: formData.password,
      });

      // 2. Handle Auto-Registration for first-time users
      // This is primarily for Legacy CSV users (Profile exists, Auth does not)
      // IF dbProfile.id exists, it means an Auth User SHOULD exist (e.g. Admin Created), 
      // so if signIn failed, it's a genuine credential issue, not a missing account.
      if (signInError && !dbProfile.id && (signInError.message.includes("Invalid login credentials") || signInError.status === 400)) {
        if (formData.password === COMMON_PASSWORD) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: emailClean,
            password: formData.password,
            options: {
              data: {
                display_name: dbProfile.username,
                full_name: dbProfile.username,
              }
            }
          });

          if (signUpError) {
            // If User already registered error, it implies a race condition or state mismatch.
            // We should treat it as a login failure info.
            if (signUpError.message.includes("User already registered")) {
              throw new Error("Account exists but login failed. Please contact Admin.");
            }
            throw signUpError;
          }

          if (signUpData.user) {
            // Update the existing profile with the new Auth ID and ensure flag is false
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                id: signUpData.user.id,
                has_setup_password: false
              })
              .eq('email', emailClean);

            if (updateError) {
              console.error("Profile Link Error:", updateError);
              throw new Error("Database error saving new user. Please contact Admin.");
            }

            toast({ title: "Welcome!", description: `Profile initialized. Please set a new password.` });
            navigate('/setup-password');
            return;
          }
        } else {
          throw new Error("Invalid password. First-time users must use 'aptix123'.");
        }
      }

      // 3. Handle Successful Login Logic
      if (authData.user) {
        // Sync ID if it was missing (for the 67 existing users)
        if (!dbProfile.id) {
          await supabase
            .from('profiles')
            .update({ id: authData.user.id })
            .eq('email', emailClean);
        }

        // REDIRECTION SECURITY: 
        // If password is the common one OR database says setup is incomplete, FORCE setup-password
        const isUsingCommon = formData.password === COMMON_PASSWORD;
        const needsSetup = dbProfile.has_setup_password === false;

        if (isUsingCommon || needsSetup) {
          toast({
            title: "Security Check",
            description: "You must change your password before continuing."
          });
          navigate('/setup-password');
        } else {
          // Success: Send to respective dashboard
          navigate(formData.role === 'user' ? '/home' : '/admin');
        }
      } else if (signInError) {
        throw signInError;
      }

    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f7fa] relative overflow-hidden p-4 md:p-8">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-[#0f2e6e]/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[600px] h-[600px] bg-[#ff7f0e]/10 rounded-full blur-[130px]" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-12 bg-white/70 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(15,46,110,0.12)] border border-white/50 overflow-hidden relative z-10">

        <div className="lg:col-span-5 bg-[#0f2e6e] p-12 relative flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <BookOpen className="absolute -right-16 -top-16 w-80 h-80 text-white rotate-12" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-12">
              <Sparkles className="h-4 w-4 text-[#ff7f0e]" />
              <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Learning Hub</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.9]">
              Aptix <br />
              <span className="text-[#ff7f0e] italic">Portal.</span>
            </h1>
            <p className="mt-8 text-blue-100/70 font-medium max-w-xs leading-relaxed text-sm">
              Master logic, solve complex problems, and sharpen your aptitude skills in one unified workspace.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm">
              <Lightbulb className="h-5 w-5 text-[#ff7f0e] mb-2" />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Learn & Solve</p>
            </div>
            <div className="p-4 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm">
              <Brain className="h-5 w-5 text-[#ff7f0e] mb-2" />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Skill Growth</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-8 md:p-16 bg-white/20 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-[#0f2e6e] tracking-tight">Welcome</h2>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.25em] mt-2">Sign in to start your session</p>
            </header>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Select Role</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-xl group-focus-within:bg-[#0f2e6e]/5 transition-colors">
                      <UserCircle className="h-4 w-4 text-slate-400 group-focus-within:text-[#0f2e6e]" />
                    </div>
                    <select id="role" value={formData.role} onChange={handleChange} className="w-full pl-16 pr-10 h-14 rounded-2xl border-2 border-transparent bg-slate-100/50 font-bold text-slate-700 focus:bg-white focus:border-[#0f2e6e]/10 outline-none appearance-none transition-all text-sm cursor-pointer">
                      <option value="user">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">College Email</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-xl group-focus-within:bg-[#0f2e6e]/5 transition-colors">
                      <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-[#0f2e6e]" />
                    </div>
                    <Input id="email" type="email" placeholder="name@college.edu.in" value={formData.email} onChange={handleChange} className="w-full pl-16 h-14 rounded-2xl border-2 border-transparent bg-slate-100/50 font-bold text-slate-700 focus:bg-white focus:border-[#0f2e6e]/10 transition-all text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Password</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-xl group-focus-within:bg-[#0f2e6e]/5 transition-colors">
                      <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-[#0f2e6e]" />
                    </div>
                    <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="w-full pl-16 h-14 rounded-2xl border-2 border-transparent bg-slate-100/50 font-bold text-slate-700 focus:bg-white focus:border-[#0f2e6e]/10 transition-all text-sm" />
                  </div>
                </div>
              </div>

              {dbProfile && (
                <div className="p-1 rounded-[2.2rem] bg-gradient-to-br from-[#0f2e6e]/5 to-[#ff7f0e]/10 border border-slate-100 animate-in zoom-in-95 duration-500">
                  <div className="bg-white/70 backdrop-blur-md rounded-[2.1rem] p-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[1.2rem] bg-[#0f2e6e] flex items-center justify-center text-white shadow-lg shadow-[#0f2e6e]/20">
                      <Fingerprint className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-[#ff7f0e] uppercase tracking-widest mb-1">Profile Found</p>
                      <h4 className="text-sm font-black text-[#0f2e6e] truncate uppercase">{formData.username}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{formData.department}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">•</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{formData.register_no}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] text-white shadow-2xl shadow-[#0f2e6e]/15 hover:scale-[1.01] active:scale-[0.99] transition-all group overflow-hidden relative" style={{ backgroundColor: PRIMARY_BLUE }} disabled={loading}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
                  <span className="flex items-center justify-center gap-3">
                    {isCorrectPassword ? "Proceed to Setup" : "Sign In"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Code2 className="h-5 w-5 text-[#0f2e6e]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Developed By</p>
                  <p className="text-[11px] font-black text-[#0f2e6e]">Varsha R G <span className="text-[#ff7f0e]">&</span> Sujitha N</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">CSE Department</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}