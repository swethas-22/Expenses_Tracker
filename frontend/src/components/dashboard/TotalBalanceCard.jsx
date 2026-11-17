import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function TotalBalanceCard({
  balance = 42500,
  income = 28000,
  expense = 15500,
  currency = 'INR'
}) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-floating bg-gradient-to-br from-[#805AD5] via-[#9061F9] to-[#A78BFA] border border-white/20">
      {/* Decorative background glows */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-900/20 rounded-full blur-xl pointer-events-none" />

      {/* Top row: Label, Eye toggle, Trend pill */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-100/90">
            Total Balance
          </span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-purple-200 hover:text-white"
            title={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>

        {/* Trend Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-bold backdrop-blur-md">
          <TrendingUp size={13} strokeWidth={2.5} />
          <span>+12%</span>
        </div>
      </div>

      {/* Balance Big Figure */}
      <div className="relative z-10 my-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm font-sans">
            {showBalance ? formatCurrency(balance, currency) : '••••••••'}
          </h2>
        </div>

        {/* 3D Pastel Wallet Illustration */}
        <div className="relative shrink-0 pr-1">
          <div className="w-16 h-14 rounded-2xl bg-gradient-to-tr from-[#9B51E0] to-[#BB6BD9] p-1.5 shadow-lg shadow-purple-900/30 border border-white/30 flex flex-col justify-between">
            {/* Golden Coin emerging */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-200 border border-white shadow-sm flex items-center justify-center -mt-3.5 ml-auto text-[11px] font-black text-amber-900 animate-bounce">
              ₹
            </div>
            <div className="w-full flex justify-end">
              <div className="w-4 h-3 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Glowing Area Spline SVG Line */}
      <div className="relative w-full h-10 my-1 overflow-hidden opacity-85">
        <svg
          viewBox="0 0 300 60"
          preserveAspectRatio="none"
          className="w-full h-full drop-shadow-[0_4px_8px_rgba(255,255,255,0.4)]"
        >
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M0,45 C40,50 70,25 110,32 C150,40 180,15 220,28 C260,38 280,10 300,18 L300,60 L0,60 Z"
            fill="url(#waveGrad)"
          />
          <path
            d="M0,45 C40,50 70,25 110,32 C150,40 180,15 220,28 C260,38 280,10 300,18"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Sub-cards: Income and Expenses */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mt-2">
        {/* Income Subcard */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
          <div className="w-8 h-8 rounded-full bg-emerald-400/25 border border-emerald-300/40 flex items-center justify-center text-emerald-200">
            <ArrowUpRight size={16} strokeWidth={2.8} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-200 block">Income</span>
            <span className="text-sm font-extrabold text-white">
              {showBalance ? formatCurrency(income, currency) : '••••'}
            </span>
          </div>
        </div>

        {/* Expenses Subcard */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
          <div className="w-8 h-8 rounded-full bg-pink-400/25 border border-pink-300/40 flex items-center justify-center text-pink-200">
            <ArrowDownRight size={16} strokeWidth={2.8} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-200 block">Expenses</span>
            <span className="text-sm font-extrabold text-white">
              {showBalance ? formatCurrency(expense, currency) : '••••'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
