import React from 'react';
import { Target, Plus, Trophy, TrendingUp } from 'lucide-react';
import { CategoryIconBadge } from '../common/IconHelper';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_BUDGETS = [
  {
    id: 'bud-groc-1',
    category: { name: 'Groceries', icon: 'shopping-cart', color: '#10B981' },
    spent: '4000.00',
    limit: '5000.00',
    percent_used: 80,
    status_label: 'On Track',
    alert_level: 'warning'
  },
  {
    id: 'bud-dine-1',
    category: { name: 'Dining Out', icon: 'utensils', color: '#F43F5E' },
    spent: '2000.00',
    limit: '2000.00',
    percent_used: 100,
    status_label: 'Limit Reached!',
    alert_level: 'exceeded'
  },
  {
    id: 'bud-trans-1',
    category: { name: 'Transport', icon: 'car', color: '#3B82F6' },
    spent: '1500.00',
    limit: '2000.00',
    percent_used: 75,
    status_label: 'Almost there',
    alert_level: 'normal'
  },
  {
    id: 'bud-shop-1',
    category: { name: 'Shopping', icon: 'shopping-bag', color: '#10B981' },
    spent: '2000.00',
    limit: '3000.00',
    percent_used: 67,
    status_label: 'On Track',
    alert_level: 'normal'
  }
];

export default function BudgetsLimitsCard({
  budgets = [],
  onOpenSetBudget,
  currency = 'INR'
}) {
  const displayBudgets = budgets.length > 0 ? budgets : DEFAULT_BUDGETS;

  return (
    <div className="glass-card rounded-3xl p-5 shadow-card bg-white/70 flex flex-col justify-between h-full">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pastel-lavender/60 flex items-center justify-center text-pastel-purple">
              <Target size={16} strokeWidth={2.5} />
            </div>
            <h3 className="font-extrabold text-base text-pastel-dark">
              Budgets & Limits
            </h3>
          </div>

          <button
            onClick={onOpenSetBudget}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-pastel-purple/15 hover:bg-pastel-purple/25 text-pastel-purple font-extrabold text-xs transition-colors"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Set Budget</span>
          </button>
        </div>

        {/* Budgets List */}
        <div className="space-y-3">
          {displayBudgets.slice(0, 4).map((b) => {
            const isExceeded = b.percent_used >= 100 || b.alert_level === 'exceeded';
            const isWarning = b.percent_used >= 80 && !isExceeded;

            let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            let barBg = 'bg-emerald-400';
            let statusText = 'On Track';

            if (isExceeded) {
              badgeBg = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
              barBg = 'bg-rose-500';
              statusText = 'Limit Reached!';
            } else if (isWarning) {
              badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
              barBg = 'bg-amber-400';
              statusText = 'Almost there';
            }

            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CategoryIconBadge
                      icon={b.category?.icon || 'tag'}
                      color={b.category?.color || '#A78BFA'}
                      size={14}
                      className="w-6 h-6"
                    />
                    <span className="font-bold text-pastel-dark text-xs">
                      {b.category?.name || 'Overall'}
                    </span>
                    <span className="text-[11px] font-semibold text-pastel-muted">
                      {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[11px] text-pastel-dark">
                      {b.percent_used}%
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}
                    >
                      {statusText}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-pastel-lavender/60 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                    style={{ width: `${Math.min(100, b.percent_used)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Encouragement Footer Banner */}
      <div className="mt-4 p-2.5 rounded-2xl bg-gradient-to-r from-amber-50/60 to-purple-50/60 border border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-pastel-dark">
          <Trophy size={16} className="text-amber-500" />
          <span>You're doing great! Keep going!</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-pastel-purple shadow-sm">
          <TrendingUp size={13} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
