import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminLogin } from '../components/admin/AdminLogin';
import { supabase } from '../lib/supabase';

export const AdminPage: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    document.title = 'Admin Leads Inbox – HotelStory';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setCheckingAuth(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[100svh] bg-[#F2F7FF] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#1D4ED8] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  return (
    <AdminDashboard
      userEmail={session.user.email || 'Admin'}
      onSignOut={handleSignOut}
    />
  );
};
