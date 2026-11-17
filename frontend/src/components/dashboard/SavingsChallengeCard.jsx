import React from 'react';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_CHALLENGE = {
  title: 'Save ₹5,000 in 30 days',
  target: 5000,
  current: 3000,
  daysLeft: 12,
  percent: 60
};

export default function SavingsChallengeCard({
  challenge,
  currency = 'INR'
}) {
  const navigate = useNavigate();
  const c = challenge || DEFAULT_CHALLENGE;

  return (
    <div
      onClick={() => navigate('/challenges')}
      className="glass-card rounded-3xl p-5 shadow-card flex items-center justify-between gap-4 relative overflow-hidden bg-gradient-to-r from-amber-50/40 via-purple-50/50 to-white cursor-pointer group"
    >
      <div className="space-y-2 z-10 flex-1">
        <div className="flex items-center gap-1.5 text-pastel-dark font-extrabold text-sm">
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Trophy size={14} strokeWidth={2.5} />
          </div>
          <span>Savings Challenge</span>
        </div>

        <h4 className="text-xs font-bold text-pastel-dark leading-tight">
          {c.title}
        </h4>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full bg-pastel-lavender/70 h-2.5 rounded-full overflow-hidden flex items-center">
            <div
              className="bg-gradient-to-r from-pastel-purple to-[#8B5CF6] h-full rounded-full transition-all duration-500"
              style={{ width: `${c.percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-pastel-muted">
            <span>
              {formatCurrency(c.current, currency)} / {formatCurrency(c.target, currency)}
            </span>
            <span className="text-pastel-purple font-extrabold">
              {c.percent}%
            </span>
          </div>

          <div className="text-[10px] font-semibold text-pastel-muted/90">
            ⏳ {c.daysLeft} days left
          </div>
        </div>
      </div>

      {/* 3D Pastel Gift Box Illustration with Ribbon */}
      <div className="relative shrink-0 z-10 pr-2 group-hover:scale-105 transition-transform duration-300">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D8B4FE] to-[#F472B6] p-1.5 shadow-md shadow-pink-200 border border-white/80 flex flex-col items-center justify-center relative">
          {/* Ribbon Bow */}
          <div className="absolute -top-2 flex gap-0.5">
            <div className="w-3 h-3 rounded-full bg-pastel-mint border border-white -rotate-12" />
            <div className="w-3 h-3 rounded-full bg-pastel-mint border border-white rotate-12" />
          </div>
          {/* Cross Ribbons */}
          <div className="w-full h-2.5 bg-white/40 absolute top-1/2 -translate-y-1/2" />
          <div className="h-full w-2.5 bg-white/40 absolute left-1/2 -translate-x-1/2" />
        </div>
      </div>
    </div>
  );
}
