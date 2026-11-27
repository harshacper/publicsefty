import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * React hook to listen to Supabase auth state changes,
 * automatically keeping the session and JWT refreshed.
 */
export const useSupabaseSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Fetch active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Subscribe to auth state changes (REFRESH_TOKEN, SIGNED_IN, SIGNED_OUT)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);

      if (currentSession?.access_token) {
        localStorage.setItem('supabase_token', currentSession.access_token);
      } else {
        localStorage.removeItem('supabase_token');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading, supabase };
};
