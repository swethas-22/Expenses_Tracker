import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export default function AnalyticsPage() {
  const { currency } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('1M');
  const [analytics, setAnalytics] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [aRes, tRes] = await Promise.all([
          api.get('/analytics/', { period }),
          api.get('/dashboard/monthly-trend/')
        ]);
        setAnalytics(aRes);
        setMonthlyTrend(tRes || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [period]);

  const PASTEL_PALETTE = ['#FB7185', '#A78BFA', '#38BDF8', '#FBBF24', '#34D399', '#F472B6', '#818CF8', '#C4B5FD'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Period Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-pastel-dark tracking-tight">
            Financial Analytics
          </h2>
          <p className="text-xs md:text-sm font-bold text-pastel-muted mt-1">
            Deep dive into your cashflow, spending velocity, and categorical allocations.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-white/80 border border-purple-100 shadow-sm text-xs font-bold">
          {['1W', '1M', '1Y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-xl transition ${
                period === p
                  ? 'bg-pastel-purple text-white shadow-sm'
                  : 'text-pastel-dark/70 hover:text-pastel-dark'
              }`}
            >
              {p === '1W' ? 'Weekly' : p === '1M' ? 'Monthly' : 'Yearly'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Income */}
        <div className="glass-card rounded-3xl p-5 shadow-card bg-white/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ArrowUpRight size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-pastel-muted uppercase">Total Income</span>
            <h3 className="text-xl font-black text-pastel-dark mt-0.5">
              {formatCurrency(analytics?.totalIncome || 28000, currency)}
            </h3>
          </div>
        </div>

        {/* Total Expense */}
        <div className="glass-card rounded-3xl p-5 shadow-card bg-white/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600">
            <ArrowDownRight size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-pastel-muted uppercase">Total Expenses</span>
            <h3 className="text-xl font-black text-pastel-dark mt-0.5">
              {formatCurrency(analytics?.totalExpense || 15500, currency)}
            </h3>
          </div>
        </div>

        {/* Highest Spending Category */}
        <div className="glass-card rounded-3xl p-5 shadow-card bg-white/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Flame size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-pastel-muted uppercase">Top Spending Category</span>
            <h3 className="text-base font-black text-pastel-dark mt-0.5 truncate">
              {analytics?.highestCategory?.name || 'Food & Dining'}
            </h3>
            <span className="text-[11px] font-bold text-pink-600">
              {formatCurrency(analytics?.highestCategory?.amount || 4960, currency)}
            </span>
          </div>
        </div>

        {/* Average Daily Expense */}
        <div className="glass-card rounded-3xl p-5 shadow-card bg-white/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <CreditCard size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-pastel-muted uppercase">Average Daily Spend</span>
            <h3 className="text-xl font-black text-pastel-dark mt-0.5">
              {formatCurrency(analytics?.averageDailyExpense || 520, currency)}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Monthly Trend (12 Months) & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses 12-Month Bar Chart */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 shadow-card bg-white/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-pastel-dark">
                Income vs Expenses Trend
              </h3>
              <p className="text-xs font-semibold text-pastel-muted">
                Last 12 months comparative cashflow
              </p>
            </div>
            <span className="text-xs font-bold text-pastel-purple">Monthly Aggregates</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#A78BFA" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#A78BFA" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  formatter={(val, name) => [formatCurrency(val, currency), name === 'income' ? 'Income' : 'Expense']}
                  contentStyle={{
                    backgroundColor: '#282044',
                    borderRadius: '14px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#34D399" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#FB7185" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut with Click-through */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 shadow-card bg-white/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-pastel-dark">
                Category Spending Allocation
              </h3>
              <p className="text-xs font-semibold text-pastel-muted">
                Click segment to view transactions
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(val, name) => [formatCurrency(val, currency), name]}
                  contentStyle={{
                    backgroundColor: '#282044',
                    borderRadius: '14px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                />
                <Pie
                  data={analytics?.categoryTotals || []}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  cornerRadius={6}
                  onClick={(entry) => {
                    if (entry && entry.id) {
                      navigate(`/transactions?category=${entry.id}`);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {(analytics?.categoryTotals || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || PASTEL_PALETTE[index % PASTEL_PALETTE.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Day of Week Spending Pattern */}
      <div className="glass-card rounded-3xl p-6 shadow-card bg-white/80">
        <h3 className="font-extrabold text-base text-pastel-dark mb-1">
          Weekly Spending Pattern by Day
        </h3>
        <p className="text-xs font-semibold text-pastel-muted mb-4">
          Pinpoint which days of the week experience the highest discretionary burn
        </p>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.dayOfWeekData || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#A78BFA" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#A78BFA" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val) => [formatCurrency(val, currency), 'Total Spent']}
                contentStyle={{
                  backgroundColor: '#282044',
                  borderRadius: '14px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="amount" fill="#A78BFA" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
