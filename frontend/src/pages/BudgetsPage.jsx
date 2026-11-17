import React, { useState, useEffect } from 'react';
import { Target, Plus, AlertTriangle, Edit2, Trash2, CheckCircle2, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { CategoryIconBadge } from '../components/common/IconHelper';
import BudgetModal from '../components/budgets/BudgetModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

export default function BudgetsPage({ selectedMonth }) {
  const { currency } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/budgets/', { month: selectedMonth });
      setBudgets(res.results || []);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/budgets/${deleteId}/`);
      setIsDeleteOpen(false);
      setDeleteId(null);
      fetchBudgets();
    } catch (err) {
      alert('Failed to delete budget.');
    }
  };

  const overallBudget = budgets.find((b) => b.category === null);
  const categoryBudgets = budgets.filter((b) => b.category !== null);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-pastel-dark tracking-tight">
            Budgets & Limits
          </h2>
          <p className="text-xs md:text-sm font-bold text-pastel-muted mt-1">
            Track monthly spending limits with automated 80% warning and 100% exceeded triggers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-extrabold shadow-floating transition-transform active:scale-95"
        >
          <Plus size={16} strokeWidth={2.8} />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Overall Budget Hero Card if exists */}
      {overallBudget && (
        <div className="glass-card rounded-3xl p-6 shadow-floating bg-gradient-to-r from-purple-50/80 via-white to-pink-50/50 border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pastel-purple flex items-center justify-center text-white shadow-sm">
                <Target size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-pastel-purple">
                  Overall Monthly Spending Cap
                </span>
                <h3 className="text-lg font-black text-pastel-dark">
                  Month of {selectedMonth}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  overallBudget.alert_level === 'exceeded'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : overallBudget.alert_level === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {overallBudget.status_label} ({overallBudget.percent_used}%)
              </span>
              <button
                onClick={() => {
                  setDeleteId(overallBudget.id);
                  setIsDeleteOpen(true);
                }}
                className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-500 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Large Progress Meter */}
          <div className="space-y-2 mt-4">
            <div className="w-full bg-pastel-lavender/60 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  overallBudget.alert_level === 'exceeded'
                    ? 'bg-rose-500'
                    : overallBudget.alert_level === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, overallBudget.percent_used)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-pastel-muted">
              <span>
                Spent: <strong className="text-pastel-dark">{formatCurrency(overallBudget.spent, currency)}</strong> of{' '}
                {formatCurrency(overallBudget.limit, currency)}
              </span>
              <span>
                Remaining:{' '}
                <strong className="text-pastel-purple">
                  {formatCurrency(overallBudget.remaining, currency)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-pastel-dark">
          Category Limits ({categoryBudgets.length})
        </h3>

        {loading ? (
          <p className="text-xs text-pastel-muted">Loading budgets...</p>
        ) : categoryBudgets.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center bg-white/70">
            <p className="text-sm font-bold text-pastel-dark">No category budgets defined for {selectedMonth}.</p>
            <p className="text-xs text-pastel-muted mt-1">
              Click "+ Create Budget" to set targeted limits for dining, groceries, shopping, and more.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryBudgets.map((b) => {
              const isExceeded = b.alert_level === 'exceeded';
              const isWarning = b.alert_level === 'warning';

              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              let barColor = 'bg-emerald-400';

              if (isExceeded) {
                badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
                barColor = 'bg-rose-500';
              } else if (isWarning) {
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                barColor = 'bg-amber-400';
              }

              return (
                <div
                  key={b.id}
                  className="glass-card rounded-3xl p-5 shadow-card bg-white/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <CategoryIconBadge
                          icon={b.category?.icon || 'tag'}
                          color={b.category?.color || '#A78BFA'}
                          size={16}
                          className="w-9 h-9"
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-pastel-dark">
                            {b.category?.name}
                          </h4>
                          <span className="text-[10px] font-bold text-pastel-muted">
                            Limit: {formatCurrency(b.limit, currency)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setDeleteId(b.id);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 my-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-pastel-dark">
                          {formatCurrency(b.spent, currency)} spent
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {b.status_label}
                        </span>
                      </div>

                      <div className="w-full bg-pastel-lavender/60 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(100, b.percent_used)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-purple-50 flex items-center justify-between text-[11px] font-bold text-pastel-muted">
                    <span>Usage: {b.percent_used}%</span>
                    <span>Remaining: {formatCurrency(b.remaining, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Creation Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBudgetSaved={fetchBudgets}
        selectedMonth={selectedMonth}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Budget Limit"
        message="Are you sure you want to delete this budget limit?"
      />
    </div>
  );
}
