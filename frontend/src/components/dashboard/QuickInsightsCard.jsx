import React from 'react';
import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickInsightsCard({
  insightText = 'You spent 15% more on dining out this week.'
}) {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-3xl p-5 shadow-card flex items-center justify-between gap-4 relative overflow-hidden bg-gradient-to-r from-purple-50/70 via-pink-50/40 to-white">
      {/* Background sparkle blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 rounded-full blur-xl pointer-events-none" />

      <div className="space-y-2 z-10 flex-1">
        <div className="flex items-center gap-1.5 text-pastel-dark font-extrabold text-sm">
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
            <Lightbulb size={14} strokeWidth={2.5} />
          </div>
          <span>Quick Insights</span>
          <Sparkles size={14} className="text-amber-400" />
        </div>

        <p className="text-xs font-semibold text-pastel-dark/85 leading-relaxed max-w-[240px]">
          {insightText}
        </p>

        <button
          onClick={() => navigate('/insights')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pastel-purple hover:bg-pastel-purple-dark text-white text-[11px] font-bold shadow-sm shadow-purple-200 transition-all transform hover:translate-x-0.5"
        >
          <span>View Details</span>
          <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* 3D Coffee Cup Illustration with heart & saucer */}
      <div className="relative shrink-0 z-10 pr-2">
        <div className="relative flex flex-col items-center">
          {/* Steam puffs */}
          <div className="flex gap-1 -mb-1 opacity-60 animate-pulse">
            <span className="text-[10px] text-pastel-purple">~</span>
            <span className="text-[10px] text-pink-400">~</span>
          </div>
          {/* Cup */}
          <div className="w-14 h-12 rounded-2xl bg-gradient-to-tr from-[#E8DDF8] to-[#FFF0F5] border-2 border-white shadow-md flex items-center justify-center relative">
            <span className="text-sm">💜</span>
            {/* Cup Handle */}
            <div className="absolute -right-2 top-2.5 w-3.5 h-6 rounded-r-xl border-2 border-white bg-[#E8DDF8]/70" />
          </div>
          {/* Saucer */}
          <div className="w-16 h-3 rounded-full bg-pastel-mint/80 border border-white shadow-sm mt-0.5" />
        </div>
      </div>
    </div>
  );
}
