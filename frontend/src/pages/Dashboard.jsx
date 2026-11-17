import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import TotalBalanceCard from '../components/dashboard/TotalBalanceCard';
import SpendingOverviewCard from '../components/dashboard/SpendingOverviewCard';
import QuickInsightsCard from '../components/dashboard/QuickInsightsCard';
import SavingsChallengeCard from '../components/dashboard/SavingsChallengeCard';
import StatisticsTrendsCard from '../components/dashboard/StatisticsTrendsCard';
import BudgetsLimitsCard from '../components/dashboard/BudgetsLimitsCard';
import QuickAddAndHistory from '../components/dashboard/QuickAddAndHistory';
import BudgetModal from '../components/budgets/BudgetModal';

export default function Dashboard({ selectedMonth }) {
  const { user, currency } = useAuth();
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recentTxs, setRecentTxs] = useState([]);
  const [quickInsightText, setQuickInsightText] = useState('You spent 15% more on dining out this week.');
  const [savingsChallenge, setSavingsChallenge] = useState(null);
  const [alertBanners, setAlertBanners] = useState([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, breakRes, budRes, recRes, insRes, chalRes] = await Promise.all([
        api.get('/dashboard/summary/', { month: selectedMonth }),
        api.get('/dashboard/category-breakdown/', { month: selectedMonth }),
        api.get('/budgets/', { month: selectedMonth }),
        api.get('/dashboard/recent/'),
        api.get('/insights/'),
        api.get('/challenges/')
      ]);

      setSummary(sumRes);
      setBreakdown(breakRes.categories || []);
      setBudgets(budRes.results || []);
      setRecentTxs(recRes || []);

      if (insRes.quick_insight) {
        setQuickInsightText(insRes.quick_insight.highlight);
      }

      if (chalRes && chalRes.length > 0) {
        const active = chalRes[0];
        setSavingsChallenge({
          title: active.title,
          target: active.target_amount,
          current: active.current_amount,
          daysLeft: active.days_left,
          percent: active.percent
        });
      }

      // Check for budget warnings / exceeded per FR-4.7
      const activeAlerts = (budRes.results || []).filter(
        (b) => b.alert_level === 'warning' || b.alert_level === 'exceeded'
      );
      setAlertBanners(activeAlerts);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const dismissAlert = (id) => {
    setAlertBanners((prev) => prev.filter((a) => a.id !== id));
  };

  const greetingName = user?.first_name || 'Swetha';

  return (
    <div className="space-y-6 pb-12">
      {/* Personalized Greeting Header matching Reference Image */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-pastel-dark tracking-tight flex items-center gap-2">
            <span>Good morning, {greetingName}!</span>
            <span className="text-2xl">👋</span>
          </h2>
          <p className="text-xs md:text-sm font-bold text-pastel-muted mt-1 flex items-center gap-1.5">
            <span>Let's make today count.</span>
            <Sparkles size={14} className="text-pastel-purple animate-spin" />
          </p>
        </div>

        {/* Cute plant illustration decoration */}
        <div className="hidden sm:flex items-center gap-2 p-2 rounded-2xl bg-white/60 border border-white/80 shadow-sm">
          <span className="text-2xl">🪴</span>
          <div className="text-left">
            <span className="text-[10px] font-bold text-pastel-muted uppercase block">Financial Growth</span>
            <span className="text-xs font-black text-emerald-600">On Track 🌱</span>
          </div>
        </div>
      </div>

      {/* Dismissible Budget Alert Banners (FR-4.7) */}
      {alertBanners.length > 0 && (
        <div className="space-y-2">
          {alertBanners.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-sm ${
                alert.alert_level === 'exceeded'
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} strokeWidth={2.5} />
                <span>
                  {alert.alert_level === 'exceeded'
                    ? `⚠️ Budget Exceeded: "${alert.category?.name || 'Overall'}" spending reached 100% of ${currency} ${alert.limit}!`
                    : `⚡ Budget Warning: "${alert.category?.name || 'Overall'}" has hit ${alert.percent_used}% of limit.`}
                </span>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-1 rounded-full hover:bg-black/5 text-current transition"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Bento Column (8 Cols on Desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Row 1: Total Balance Card & Spending Overview Donut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TotalBalanceCard
              balance={summary?.total_balance || 42500}
              income={summary?.period_income || 28000}
              expense={summary?.period_expense || 15500}
              currency={currency}
            />
            <SpendingOverviewCard
              breakdown={breakdown}
              totalSpending={summary?.period_expense || 15500}
              currency={currency}
            />
          </div>

          {/* Row 2: Quick Insights Card & Savings Challenge Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickInsightsCard insightText={quickInsightText} />
            <SavingsChallengeCard challenge={savingsChallenge} currency={currency} />
          </div>

          {/* Row 3: Statistics & Trends & Budgets & Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatisticsTrendsCard currency={currency} />
            <BudgetsLimitsCard
              budgets={budgets}
              onOpenSetBudget={() => setIsBudgetModalOpen(true)}
              currency={currency}
            />
          </div>
        </div>

        {/* Right Column: Quick Add Transaction & Transaction History (4 Cols on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          <QuickAddAndHistory
            recentTransactions={recentTxs}
            onTransactionAdded={fetchDashboardData}
            currency={currency}
          />
        </div>
      </div>

      {/* Set Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onBudgetSaved={fetchDashboardData}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
