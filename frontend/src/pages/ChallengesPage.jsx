import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Sparkles, CheckCircle2, Gift, Flame, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export default function ChallengesPage() {
  const { currency } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contributeTarget, setContributeTarget] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [loading, setLoading] = useState(true);

  const loadChallenges = async () => {
    try {
      const res = await api.get('/challenges/');
      setChallenges(res || []);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/challenges/', {
        title,
        description,
        target_amount: targetAmount,
        duration_days: durationDays
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setTargetAmount('');
      loadChallenges();
    } catch (err) {
      alert(err.detail || 'Failed to create challenge.');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!contributeTarget) return;

    try {
      const res = await api.post(`/challenges/${contributeTarget.id}/contribute/`, {
        amount: contributeAmount
      });

      if (res.is_completed) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setContributeTarget(null);
      setContributeAmount('');
      loadChallenges();
    } catch (err) {
      alert(err.detail || 'Contribution failed.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-pastel-dark tracking-tight flex items-center gap-2">
            <span>Savings Challenges</span>
            <Trophy size={24} className="text-amber-500" />
          </h2>
          <p className="text-xs md:text-sm font-bold text-pastel-muted mt-1">
            Build lasting wealth habits through gamified target challenges and milestone badges.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-extrabold shadow-floating transition-transform active:scale-95"
        >
          <Plus size={16} strokeWidth={2.8} />
          <span>New Challenge</span>
        </button>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((c) => {
          const isCompleted = c.is_completed || c.status === 'completed';

          return (
            <div
              key={c.id}
              className={`glass-card rounded-3xl p-6 shadow-card flex flex-col justify-between transition-all ${
                isCompleted
                  ? 'bg-gradient-to-br from-emerald-50/80 via-white to-purple-50/50 border-emerald-200'
                  : 'bg-white/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>{c.badge}</span>
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {isCompleted ? 'Completed 🎉' : `${c.days_left} days left`}
                  </span>
                </div>

                <h3 className="font-black text-base text-pastel-dark mb-1">
                  {c.title}
                </h3>
                <p className="text-xs text-pastel-muted font-medium mb-4">
                  {c.description || 'Target savings challenge for better financial health.'}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3">
                  <div className="w-full bg-pastel-lavender/60 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-pastel-purple to-[#8B5CF6]'
                      }`}
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-pastel-dark">
                      {formatCurrency(c.current_amount, currency)} / {formatCurrency(c.target_amount, currency)}
                    </span>
                    <span className="text-pastel-purple font-extrabold">{c.percent}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-50 flex items-center justify-between">
                {isCompleted ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 size={16} />
                    <span>Goal Unlocked!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setContributeTarget(c)}
                    className="w-full py-2 rounded-xl bg-pastel-purple/15 hover:bg-pastel-purple/25 text-pastel-purple font-extrabold text-xs transition"
                  >
                    + Add Savings Contribution
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Challenge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pastel-dark/30 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-floating border border-purple-100">
            <div className="flex items-center justify-between pb-3 border-b border-purple-50">
              <h3 className="font-extrabold text-lg text-pastel-dark">Start Savings Challenge</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-pastel-dark mb-1">
                  Challenge Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Save ₹5,000 in 30 days"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-pastel-dark mb-1">
                  Goal Motivation / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emergency fund starter or holiday flight"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-medium text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-pastel-dark mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="5000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-pastel-dark mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-pastel-dark text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-bold shadow-md shadow-purple-200 transition"
                >
                  Start Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {contributeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pastel-dark/30 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-floating border border-purple-100">
            <h3 className="font-extrabold text-base text-pastel-dark mb-1">
              Add Savings Contribution
            </h3>
            <p className="text-xs text-pastel-muted mb-4 truncate">
              To: {contributeTarget.title}
            </p>

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-pastel-dark mb-1">
                  Amount to add ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="e.g. 500"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-sm font-black text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setContributeTarget(null)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-pastel-dark text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-bold shadow-sm transition"
                >
                  Contribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
