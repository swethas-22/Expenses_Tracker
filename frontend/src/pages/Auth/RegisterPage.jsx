import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ password_confirm: ['Passwords do not match.'] });
      return;
    }

    setLoading(true);
    try {
      await register({
        username,
        email,
        first_name: firstName,
        password
      });
      navigate('/');
    } catch (err) {
      if (typeof err === 'object') {
        setErrors(err);
      } else {
        setErrors({ general: 'Registration failed.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFF9F4] via-[#F8F4FD] to-[#E8DDF8]/40">
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-4xl p-8 shadow-floating border border-purple-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-pastel-dark tracking-tight">
            Create SpendQuest Account
          </h2>
          <p className="text-xs font-bold text-pastel-muted mt-1">
            Join thousands tracking and planning their finances effortlessly.
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Swetha"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Username *
            </label>
            <input
              type="text"
              placeholder="swetha"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
            {errors.username && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.username[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="swetha@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
            {errors.email && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Password (&gt;= 8 characters) *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
            {errors.password && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.password[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
            {errors.password_confirm && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.password_confirm[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white text-xs font-extrabold shadow-floating transition-all flex items-center justify-center gap-2 transform active:scale-98 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </form>

        <div className="mt-5 text-center text-xs font-bold text-pastel-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-pastel-purple hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
