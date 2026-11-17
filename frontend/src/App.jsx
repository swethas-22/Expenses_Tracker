import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';

// Pages
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import ChallengesPage from './pages/ChallengesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';

function ProtectedLayout({ children, selectedMonth, onMonthChange }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-cream">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-pastel-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-pastel-muted">Loading SpendQuest...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-pastel-cream font-sans">
      {/* Persistent Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar selectedMonth={selectedMonth} onMonthChange={onMonthChange} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileNav />
    </div>
  );
}

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState('2025-03');

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedLayout selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}>
                <Dashboard selectedMonth={selectedMonth} />
              </ProtectedLayout>
            }
          />
          <Route
            path="/dashboard"
            element={<Navigate to="/" replace />}
          />
          <Route
            path="/transactions"
            element={
              <ProtectedLayout selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}>
                <TransactionsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedLayout selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}>
                <BudgetsPage selectedMonth={selectedMonth} />
              </ProtectedLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedLayout selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}>
                <AnalyticsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedLayout selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}>
                <AIInsightsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/challenges"
            element={
              <ProtectedLayout selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}>
                <ChallengesPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedLayout selectedMonth={selectedMonth} onMonthChange={setSelectedMonth}>
                <SettingsPage />
              </ProtectedLayout>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
