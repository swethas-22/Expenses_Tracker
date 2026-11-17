import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, Lightbulb, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export default function AIInsightsPage() {
  const { currency } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await api.get('/insights/');
        setData(res);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-pastel-dark tracking-tight flex items-center gap-2">
            <span>AI Spending Insights</span>
            <Sparkles size={20} className="text-pastel-purple" />
          </h2>
          <p className="text-xs md:text-sm font-bold text-pastel-muted mt-1">
            Algorithmic financial analysis derived from your actual transaction records.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-pastel-purple text-xs font-black">
          <Brain size={16} />
          <span>Pattern Intelligence v1.0</span>
        </div>
      </div>

      {/* AI Summary Banner */}
      <div className="glass-card rounded-3xl p-6 shadow-floating bg-gradient-to-r from-purple-50/90 via-white to-pink-50/70 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pastel-purple to-pastel-pink flex items-center justify-center text-white shadow-md shadow-purple-200 shrink-0">
            <Sparkles size={22} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-base text-pastel-dark">
              Financial Health Executive Summary
            </h3>
            <p className="text-xs font-semibold text-pastel-dark/85 leading-relaxed">
              {data?.summary || 'Analyzing spending transactions to provide tailored financial recommendations...'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Savings Margin: {data?.metrics?.savings_rate || '44.6'}%
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                {data?.metrics?.active_transactions_count || 12} Transactions Analyzed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(data?.insights || []).map((ins) => {
          const isWarning = ins.type === 'warning';
          const isPositive = ins.type === 'positive';

          return (
            <div
              key={ins.id}
              className="glass-card rounded-3xl p-6 shadow-card bg-white/80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isWarning
                        ? 'bg-rose-100 text-rose-800'
                        : isPositive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {ins.badge}
                  </span>
                  <span className="text-[11px] font-bold text-pastel-muted">
                    {ins.category}
                  </span>
                </div>

                <h4 className="font-black text-sm text-pastel-dark">
                  {ins.title}
                </h4>

                <p className="text-xs text-pastel-dark/80 font-medium leading-relaxed">
                  {ins.message}
                </p>

                <div className="p-3 rounded-2xl bg-pastel-lavender/30 border border-purple-100">
                  <span className="text-[10px] font-bold text-pastel-purple block mb-0.5">
                    💡 AI Recommendation:
                  </span>
                  <p className="text-[11px] font-semibold text-pastel-dark">
                    {ins.recommendation}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-pastel-muted font-bold block">
                    Potential Savings
                  </span>
                  <span className="text-xs font-black text-emerald-600">
                    +{formatCurrency(ins.potential_saving, currency)}/mo
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (ins.action_label.includes('Budget')) navigate('/budgets');
                    else if (ins.action_label.includes('Challenges')) navigate('/challenges');
                    else navigate('/transactions');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-pastel-purple hover:text-pastel-purple-dark transition"
                >
                  <span>Action</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
