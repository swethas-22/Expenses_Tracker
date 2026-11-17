import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ReceiptText,
  BarChart3,
  BookmarkCheck,
  Sparkles,
  Brain,
  Settings,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const health = user?.financial_health || 94;

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Transactions', path: '/transactions', icon: ReceiptText },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Budgets', path: '/budgets', icon: BookmarkCheck },
    { label: 'Challenges', path: '/challenges', icon: Sparkles },
    { label: 'AI Insights', path: '/insights', icon: Brain },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen p-5 bg-white/60 backdrop-blur-xl border-r border-pastel-border/60 justify-between select-none shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#A78BFA] to-[#C4B5FD] flex items-center justify-center shadow-lg shadow-purple-200">
            {/* Crown Wallet Emblem */}
            <div className="absolute -top-1.5 -right-1 text-amber-300 text-sm drop-shadow-md">👑</div>
            <svg
              className="w-6 h-6 text-white drop-shadow-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-pastel-dark tracking-tight leading-none">
              SpendQuest
            </h1>
            <p className="text-[11px] font-semibold text-pastel-muted tracking-wider mt-1">
              Track • Plan • Grow
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-pastel-purple text-white shadow-md shadow-purple-200 translate-x-1'
                      : 'text-pastel-dark/70 hover:bg-pastel-lavender/40 hover:text-pastel-dark'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.4 : 2}
                      className={isActive ? 'text-white' : 'text-pastel-purple'}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Floating Motivational & Health Widgets */}
      <div className="space-y-4 pt-4">
        {/* Financial Health Card */}
        <div className="glass-card rounded-2xl p-3.5 relative overflow-hidden bg-gradient-to-br from-white/90 to-pastel-lavender/30 border border-purple-100/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold text-pastel-muted uppercase tracking-wider block">
                Financial Health
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-extrabold text-pastel-dark">{health}%</span>
                <span className="text-xs font-bold text-emerald-600">Excellent!</span>
              </div>
            </div>
            {/* Cute Plant Illustration */}
            <div className="w-10 h-10 rounded-2xl bg-pastel-mint flex items-center justify-center text-emerald-700 shadow-sm text-lg">
              🪴
            </div>
          </div>
          <div className="w-full bg-pastel-lavender/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pastel-purple to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${health}%` }}
            />
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="rounded-2xl p-3 text-center bg-gradient-to-b from-purple-50 to-pink-50/70 border border-pink-100/60">
          <div className="flex justify-center mb-1">
            <span className="text-xl">🌱</span>
          </div>
          <p className="text-xs font-bold text-pastel-dark font-sans italic">
            Dream Big, Save Bigger! 💜
          </p>
        </div>
      </div>
    </aside>
  );
}
