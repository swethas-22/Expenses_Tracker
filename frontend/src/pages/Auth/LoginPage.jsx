import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await loginDemo();
      navigate('/');
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFF9F4] via-[#F8F4FD] to-[#E8DDF8]/40">
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-4xl p-8 shadow-floating border border-purple-100">
        {/* Brand Emblem */}
        <div className="text-center mb-6">
          <div className="inline-flex relative w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] items-center justify-center shadow-lg shadow-purple-200 mb-3">
            <span className="absolute -top-1.5 -right-1 text-base">👑</span>
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-pastel-dark tracking-tight">
            Welcome to SpendQuest
          </h2>
          <p className="text-xs font-bold text-pastel-muted mt-1">
            Track • Plan • Grow
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-pastel-purple" fill="currentColor" />
            <div>
              <p className="text-xs font-black text-pastel-dark">1-Click Demo Evaluation</p>
              <p className="text-[10px] text-pastel-muted">Pre-seeded with Swetha's dashboard</p>
            </div>
          </div>
          <button
            onClick={handleDemo}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-extrabold shadow-sm transition transform active:scale-95"
          >
            Demo Login
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Email or Username
            </label>
            <input
              type="text"
              placeholder="swetha@spendquest.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-pastel-dark">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-pastel-purple hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white text-xs font-extrabold shadow-floating transition-all flex items-center justify-center gap-2 transform active:scale-98"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-bold text-pastel-muted">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-pastel-purple hover:underline">
            Register for free
          </Link>
        </div>
      </div>
    </div>
  );
}
