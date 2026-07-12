import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

// TODO: implement by Anand Rawat (Scaffold complete, LoginPage fully wired)
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  const from = location.state?.from?.pathname || '/app';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-stretch justify-center bg-slate-950 text-slate-100">
      {/* Visual Branding Panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-slate-900 p-12 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"></div>
        <div className="absolute -right-1/4 -bottom-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl"></div>

        {/* Logo */}
        <div className="flex items-center space-x-3 z-10">
          <div className="rounded-xl bg-brand-600 p-2.5 text-white">
            <Truck className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Transit<span className="text-brand-500">Ops</span>
          </span>
        </div>

        {/* Hero message */}
        <div className="z-10 my-auto space-y-6">
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Streamline your fleet and transport operations.
          </h2>
          <p className="text-lg text-slate-400 max-w-md">
            Manage vehicles, dispatch trips, optimize maintenance, track fuel, and analyze expenses in one unified dashboard.
          </p>
          <div className="flex items-center space-x-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Real-time dispatch</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-brand-500"></span>
              <span>Operational Analytics</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-500 z-10">
          &copy; {new Date().getFullYear()} TransitOps Platform. All rights reserved.
        </p>
      </div>

      {/* Login Form Panel */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center items-center px-8 sm:px-16 lg:px-24 bg-slate-950 relative">
        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center space-x-3 mb-8 absolute top-8 left-8">
          <div className="rounded-lg bg-brand-600 p-1.5 text-white">
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-white">TransitOps</span>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in with your operational credentials.
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 animate-fadeIn">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="manager@transitops.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 transition-all focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center items-center rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-500 hover:shadow-brand-500/35 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 active:scale-98"
              >
                {submitting ? <LoadingSpinner size="sm" color="white" /> : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials */}
          <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-4">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p><span className="font-semibold text-slate-400">Fleet Manager:</span> manager@transitops.com / password123</p>
              <p><span className="font-semibold text-slate-400">Driver:</span> driver@transitops.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
