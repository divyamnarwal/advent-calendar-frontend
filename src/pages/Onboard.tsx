import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import type { Country } from '../types';

export function Onboard() {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle, isLoading, hasActiveSession } = useAuth();

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState<Country>('GLOBAL');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (hasActiveSession) {
      navigate('/', { replace: true });
    }
  }, [hasActiveSession, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in email and password');
      return;
    }

    if (mode === 'sign-up' && !name.trim()) {
      setError('Name is required for sign up');
      return;
    }

    try {
      await loginWithEmail({
        mode,
        name: name.trim(),
        email: email.trim(),
        password,
        country,
      });
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }

      const fallback = 'Failed to authenticate. Please try again.';
      if (typeof err === 'object' && err !== null && 'errors' in err) {
        const clerkErrors = (err as { errors?: Array<{ message?: string }> }).errors;
        setError(clerkErrors?.[0]?.message || fallback);
        return;
      }

      setError(fallback);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg mb-4">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-serif">
            Welcome to Campus Advent
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Complete challenges, build streaks, and turn every win into a memory.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 card-hover animate-scale-in">
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1 mb-5">
            <button
              type="button"
              onClick={() => setMode('sign-in')}
              disabled={isLoading}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'sign-in'
                  ? 'bg-white dark:bg-violet-600 text-violet-700 dark:text-white shadow-md ring-1 ring-violet-200 dark:ring-violet-400/50'
                  : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('sign-up')}
              disabled={isLoading}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'sign-up'
                  ? 'bg-white dark:bg-violet-600 text-violet-700 dark:text-white shadow-md ring-1 ring-violet-200 dark:ring-violet-400/50'
                  : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
              }`}
            >
              Sign Up
            </button>
          </div>
          <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-5">
            {mode === 'sign-in'
              ? 'Pick up where you left off.'
              : 'Start your first challenge in under a minute.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'sign-up' && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:focus:ring-violet-400/35 outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:focus:ring-violet-400/35 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:focus:ring-violet-400/35 outline-none transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {mode === 'sign-up' && (
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Campus / Region
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value as Country)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 dark:focus:ring-violet-400/35 outline-none transition-all"
                  disabled={isLoading}
                >
                  <option value="GLOBAL">Global</option>
                  <option value="INDIA">India</option>
                  <option value="RUSSIA">Russia</option>
                </select>
              </div>
            )}

            {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200 dark:shadow-violet-900/50 hover:shadow-[0_14px_34px_-14px_rgba(168,85,247,0.75)] dark:hover:shadow-[0_14px_34px_-14px_rgba(192,132,252,0.58)]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" />
                  Authenticating...
                </span>
              ) : mode === 'sign-up' ? (
                'Start My Journey'
              ) : (
                'Continue to Campus Advent'
              )}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 border border-violet-200 dark:border-violet-500/40 rounded-xl font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_0_3px_rgba(168,85,247,0.14)] dark:hover:shadow-[0_0_0_3px_rgba(192,132,252,0.2)]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    fill="#4285F4"
                    d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.68h5.39a4.6 4.6 0 0 1-2 3.01v2.5h3.24c1.9-1.75 2.97-4.33 2.97-7.24Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.41 13.9A5.99 5.99 0 0 1 6.1 12c0-.66.11-1.3.31-1.9V7.5H3.07A10 10 0 0 0 2 12c0 1.61.39 3.13 1.07 4.5l3.34-2.6Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.98c1.47 0 2.78.5 3.82 1.48l2.86-2.86C16.95 2.98 14.7 2 12 2A10 10 0 0 0 3.07 7.5l3.34 2.6C7.2 7.74 9.4 5.98 12 5.98Z"
                  />
                </svg>
                Continue with Google (Recommended)
              </span>
            </button>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Your data stays private. We never post without permission.
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Track streaks, unlock milestones, and save memories.
        </p>
      </div>
    </div>
  );
}
