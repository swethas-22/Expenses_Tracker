import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/password-reset/', { email });
      setMessage(res.detail);
      if (res.mock_reset_token) {
        setResetToken(res.mock_reset_token);
      }
      setStep(2);
    } catch (err) {
      setError('Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/password-reset/confirm/', {
        token: resetToken,
        new_password: newPassword
      });
      setMessage(res.detail);
      setStep(3);
    } catch (err) {
      setError(err.detail || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFF9F4] via-[#F8F4FD] to-[#E8DDF8]/40">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-4xl p-8 shadow-floating border border-purple-100 text-center">
        <div className="w-12 h-12 rounded-2xl bg-pastel-lavender flex items-center justify-center text-pastel-purple mx-auto mb-3">
          <KeyRound size={22} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-pastel-dark tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs font-bold text-pastel-muted mt-1 mb-6">
          Recover your SpendQuest account credentials securely.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 text-rose-800 text-xs font-bold text-left">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequest} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">
                Registered Email
              </label>
              <input
                type="email"
                placeholder="swetha@spendquest.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-extrabold shadow-floating transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleConfirm} className="space-y-4 text-left">
            <div className="p-3 rounded-2xl bg-purple-50 text-[11px] font-bold text-pastel-dark mb-2">
              ✓ Reset token generated: <code className="text-pastel-purple">{resetToken}</code>
            </div>

            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">
                Enter Reset Token
              </label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">
                New Password (&gt;= 8 characters)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-extrabold shadow-floating transition-all"
            >
              {loading ? 'Resetting...' : 'Confirm New Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-xs font-bold text-emerald-800">{message}</p>
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 rounded-2xl bg-pastel-purple text-white text-xs font-extrabold shadow-sm"
            >
              Sign In with New Password
            </Link>
          </div>
        )}

        <div className="mt-6 text-xs font-bold text-pastel-muted">
          Remembered your password?{' '}
          <Link to="/login" className="text-pastel-purple hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
