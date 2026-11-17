import React, { useState, useEffect } from 'react';
import { X, Target, Plus, Check } from 'lucide-react';
import { api } from '../../services/api';

export default function BudgetModal({ isOpen, onClose, onBudgetSaved, selectedMonth }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('overall');
  const [month, setMonth] = useState(selectedMonth || '2025-03');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMonth(selectedMonth || '2025-03');
      setError('');
      setLimit('');
      api.get('/categories/')
        .then((cats) => {
          setCategories(cats.filter((c) => c.type === 'expense'));
        })
        .catch(() => {});
    }
  }, [isOpen, selectedMonth]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Limit must be a positive number greater than 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/budgets/', {
        month,
        category: category === 'overall' ? null : category,
        limit: numLimit.toFixed(2)
      });
      onBudgetSaved();
      onClose();
    } catch (err) {
      setError(err.detail || err.limit?.[0] || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pastel-dark/30 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-floating border border-purple-100">
        <div className="flex items-center justify-between pb-3 border-b border-purple-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pastel-lavender flex items-center justify-center text-pastel-purple">
              <Target size={18} strokeWidth={2.5} />
            </div>
            <h3 className="font-extrabold text-lg text-pastel-dark">Set Budget</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Target Month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Category Scope
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            >
              <option value="overall">🌐 Overall Monthly Budget (All Expenses)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Spending Limit Amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-base font-black text-pastel-purple">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 5000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
                className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl bg-white border border-purple-100 text-base font-black text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              />
            </div>
            <p className="text-[11px] text-pastel-muted mt-1">
              You will receive automated visual warnings at 80% and 100% of this limit.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-pastel-dark text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-bold shadow-md shadow-purple-200 transition"
            >
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
