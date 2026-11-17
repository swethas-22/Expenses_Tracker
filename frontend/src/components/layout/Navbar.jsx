import React, { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ selectedMonth, onMonthChange }) {
  const { user, logout, currency } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const months = [
    { value: '2025-01', label: 'Jan 2025' },
    { value: '2025-02', label: 'Feb 2025' },
    { value: '2025-03', label: 'Mar 2025' },
    { value: '2025-04', label: 'Apr 2025' },
    { value: '2025-05', label: 'May 2025' }
  ];

  return (
    <header className="w-full flex items-center justify-between gap-4 py-4 px-6 bg-white/40 backdrop-blur-md border-b border-pastel-border/50 sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pastel-muted">
          <Search size={18} strokeWidth={2.2} />
        </div>
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/80 border border-pastel-lavender focus:border-pastel-purple focus:ring-2 focus:ring-pastel-purple/20 text-sm text-pastel-dark placeholder:text-pastel-muted/70 transition-all outline-none shadow-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              navigate(`/transactions?search=${encodeURIComponent(e.target.value)}`);
            }
          }}
        />
      </div>

      {/* Right Controls: Decorative Plant, Month Selector, Notifications, User */}
      <div className="flex items-center gap-3.5">
        {/* Month Selector Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 border border-pastel-lavender/90 shadow-sm text-xs font-bold text-pastel-dark hover:bg-pastel-lavender/30 cursor-pointer transition-colors">
            <Calendar size={14} className="text-pastel-purple" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent text-pastel-dark text-xs font-bold cursor-pointer outline-none appearance-none pr-4"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="text-pastel-muted -ml-3 pointer-events-none" />
          </div>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-full bg-white/90 border border-pastel-lavender flex items-center justify-center text-pastel-dark hover:bg-pastel-lavender/40 transition-colors shadow-sm"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={2.2} />
            {/* Notification Badge */}
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-floating border border-purple-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-purple-50">
                <span className="font-bold text-xs uppercase tracking-wider text-pastel-muted">
                  Alerts & Insights
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  2 New
                </span>
              </div>
              <div className="space-y-3 mt-3">
                <div className="p-2.5 rounded-xl bg-pink-50/80 border border-pink-100 text-xs">
                  <span className="font-bold text-pink-800 block">⚠️ Budget Limit Reached!</span>
                  <p className="text-pink-700/90 text-[11px] mt-0.5">
                    Dining Out has hit 100% of its monthly limit (₹2,000 / ₹2,000).
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-xs">
                  <span className="font-bold text-amber-800 block">⚡ Budget Warning</span>
                  <p className="text-amber-700/90 text-[11px] mt-0.5">
                    Groceries has reached 80% of limit (₹4,000 / ₹5,000).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full bg-white/90 border border-pastel-lavender hover:bg-pastel-lavender/30 transition shadow-sm"
          >
            {/* Cute Illustrated Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pastel-purple to-pastel-pink flex items-center justify-center text-white font-bold text-xs ring-2 ring-purple-100">
              {user?.first_name ? user.first_name[0] : 'S'}
            </div>
            <span className="text-xs font-bold text-pastel-dark pr-1 hidden sm:inline">
              {user?.first_name || 'Swetha'}
            </span>
            <ChevronDown size={14} className="text-pastel-muted pr-1" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-floating border border-purple-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-purple-50">
                <p className="text-xs font-extrabold text-pastel-dark">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[11px] text-pastel-muted truncate">{user?.email}</p>
                <p className="text-[10px] font-bold text-pastel-purple mt-0.5">
                  Currency: {currency}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-pastel-dark hover:bg-pastel-lavender/40 flex items-center gap-2"
              >
                <User size={14} /> Profile & Settings
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-purple-50"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
