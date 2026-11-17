import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ReceiptText, BookmarkCheck, BarChart3, Sparkles } from 'lucide-react';

export default function MobileNav() {
  const tabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Transactions', path: '/transactions', icon: ReceiptText },
    { label: 'Budgets', path: '/budgets', icon: BookmarkCheck },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Challenges', path: '/challenges', icon: Sparkles },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-pastel-border/80 px-4 py-2 flex items-center justify-around z-40 shadow-card">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-pastel-purple font-bold scale-105'
                  : 'text-pastel-muted hover:text-pastel-dark font-medium'
              }`
            }
          >
            <Icon size={20} strokeWidth={2.2} />
            <span className="text-[10px]">{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
