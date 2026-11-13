import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { BrandWordmark } from '../ui/BrandMark';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!supabase || !isSupabaseConfigured) {
      setError(
        'Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      );
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full min-h-[46px] rounded-xl bg-[#FFFFFF] border border-[#DCEBFF] px-4 py-3 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/55 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all';

  return (
    <div className="min-h-[100svh] bg-[#F2F7FF] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-2xl bg-[#FFFFFF] border border-[#DCEBFF] shadow-[0_20px_50px_rgba(10,31,92,0.08)] p-6 sm:p-8 md:p-10">
        <div className="flex flex-col items-center text-center mb-7 sm:mb-8">
          <BrandWordmark light={false} className="mb-5" />
          <div className="w-11 h-11 rounded-full bg-[#F2F7FF] border border-[#DCEBFF] flex items-center justify-center text-[#1D4ED8] mb-4">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="font-display font-bold tracking-tight text-2xl text-[#0A1F5C] mb-1.5">
            Leads Inbox
          </h1>
          <p className="text-sm sm:text-base text-[#44546F]">
            Sign in with your administrator account to manage enquiries.
          </p>
        </div>

        <form onSubmit={handleSignIn} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hotelstory.agency"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#44546F] hover:text-[#1D4ED8] transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-sm font-medium text-[#DC2626]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-6 py-3.5 text-base sm:text-sm font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] hover:shadow-[0_12px_28px_rgba(59,130,246,0.35)] disabled:opacity-70 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
