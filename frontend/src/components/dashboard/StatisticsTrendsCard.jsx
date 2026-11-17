import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { BarChart3, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_SERIES = {
  '1W': [
    { label: 'Mon', amount: 800 },
    { label: 'Tue', amount: 1400 },
    { label: 'Wed', amount: 600 },
    { label: 'Thu', amount: 2100 },
    { label: 'Fri', amount: 1800 },
    { label: 'Sat', amount: 3200 },
    { label: 'Sun', amount: 2600 }
  ],
  '1M': [
    { label: 'Mar 1', amount: 2400 },
    { label: 'Mar 8', amount: 6200 },
    { label: 'Mar 15', amount: 12500 },
    { label: 'Mar 22', amount: 14100 },
    { label: 'Mar 31', amount: 15500 }
  ],
  '3M': [
    { label: 'Jan', amount: 14800 },
    { label: 'Feb', amount: 15100 },
    { label: 'Mar', amount: 15500 }
  ],
  '1Y': [
    { label: 'Q1', amount: 45400 },
    { label: 'Q2', amount: 42100 },
    { label: 'Q3', amount: 48900 },
    { label: 'Q4', amount: 51200 }
  ]
};

export default function StatisticsTrendsCard({ currency = 'INR' }) {
  const [activeTab, setActiveTab] = useState('1M');
  const navigate = useNavigate();

  const data = DEFAULT_SERIES[activeTab] || DEFAULT_SERIES['1M'];

  return (
    <div className="glass-card rounded-3xl p-5 shadow-card bg-white/70">
      {/* Top Header & Timeframe Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pastel-lavender/60 flex items-center justify-center text-pastel-purple">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-pastel-dark">
              Statistics & Trends
            </h3>
            <span className="text-[11px] font-bold text-pastel-muted">Your Spending Trend</span>
          </div>
        </div>

        {/* 1W 1M 3M 1Y Filter Tabs */}
        <div className="flex items-center p-1 rounded-full bg-pastel-lavender/50 border border-purple-100 text-xs font-bold">
          {['1W', '1M', '3M', '1Y'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full transition-all text-xs font-bold ${
                activeTab === tab
                  ? 'bg-pastel-purple text-white shadow-sm'
                  : 'text-pastel-dark/70 hover:text-pastel-dark'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Chart and Month-over-Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Trend Area Chart */}
        <div className="md:col-span-8 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#A78BFA"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={5}
              />
              <YAxis
                stroke="#A78BFA"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
              />
              <Tooltip
                formatter={(val) => [formatCurrency(val, currency), 'Spending']}
                contentStyle={{
                  backgroundColor: '#282044',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 24px rgba(40, 32, 68, 0.2)'
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#8B5CF6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right side summary card */}
        <div className="md:col-span-4 rounded-2xl p-3.5 bg-gradient-to-br from-purple-50 to-pink-50/60 border border-purple-100/70 flex flex-col justify-between h-full">
          <div>
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-2">
              <Star size={14} fill="currentColor" />
            </div>
            <p className="text-xs font-bold text-pastel-dark leading-snug">
              You spent <span className="text-pink-600 font-extrabold">15% more</span> than last month.
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            {/* Mini 3D bar graphic */}
            <div className="flex items-end gap-1 h-8 opacity-80">
              <div className="w-2 bg-pastel-purple/50 rounded-t h-4" />
              <div className="w-2 bg-pastel-purple/70 rounded-t h-6" />
              <div className="w-2 bg-pastel-purple rounded-t h-8" />
            </div>

            <button
              onClick={() => navigate('/analytics')}
              className="text-[11px] font-extrabold text-pastel-purple hover:text-pastel-purple-dark flex items-center gap-1 transition"
            >
              <span>View Analytics</span>
              <ArrowRight size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
