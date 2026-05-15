import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const adminEmailList = (((import.meta as any).env?.VITE_ADMIN_EMAILS as string) || 'training@act.edu.in')
    .split(',')
    .map((e) => e.trim().toLowerCase());

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(loadingTimeout);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      clearTimeout(loadingTimeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // 1. Handle Silent Token Refreshes (Don't block UI)
      if (event === 'TOKEN_REFRESHED') {
        if (session?.user) setUser(session.user);
        return;
      }

      // 2. Handle Login / Logout / Initial Session
      if (session?.user) {
        setLoading(true); // CRITICAL: Block UI to prevent redirects before profile loads
        setUser(session.user);
        fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (authUser: User) => {
    try {
      const userId = authUser.id;
      const email = authUser.email?.toLowerCase();

      // 1. Try to fetch by ID first (The standard way)
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // 2. FALLBACK: If not found by ID, try fetching by email 
      // This is crucial for users imported via CSV or common password setup
      if (!data && email) {
        const { data: emailData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (emailData) {
          // Sync the ID immediately so future lookups are faster
          await supabase.from('profiles').update({ id: userId }).eq('email', email);
          data = { ...emailData, id: userId };
        }
      }

      if (error) throw error;

      // 3. Handle Profile Initialization if still missing
      if (!data) {
        await supabase.rpc('initialize_profile_if_missing', { p_user_id: userId });
        const { data: reloaded } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        data = reloaded;
      }

      // 4. Admin/Staff Promotion Logic
      if (data && email && adminEmailList.includes(email)) {
        if (data.role !== 'admin' && data.role !== 'staff') {
          try {
            await supabase.rpc('grant_admin_role', { p_user_id: userId, p_email: email });
            const { data: updated } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            setProfile(updated as Profile);
          } catch (e) {
            setProfile(data as Profile);
          }
        } else {
          setProfile(data as Profile);
        }
      } else {
        setProfile(data as Profile);
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem('lastRole');
    return { error };
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin'
  };
}