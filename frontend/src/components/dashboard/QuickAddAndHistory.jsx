import React, { useState, useRef } from 'react';
import {
  Zap,
  ArrowDown,
  ArrowUp,
  X,
  Camera,
  ArrowRight,
  Clock,
  Download,
  Search,
  Calendar,
  ChevronDown,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { CategoryIconBadge } from '../common/IconHelper';
import { formatCurrency, formatDateRelative } from '../../utils/formatters';
import { api } from '../../services/api';

const QUICK_CATEGORIES = [
  { id: 'cat-groceries', name: 'Groceries', icon: 'shopping-cart', color: '#10B981' },
  { id: 'cat-transport', name: 'Transport', icon: 'car', color: '#3B82F6' },
  { id: 'cat-food', name: 'Dining', icon: 'utensils', color: '#F43F5E' },
  { id: 'cat-bills', name: 'Bills', icon: 'home', color: '#F59E0B' },
  { id: 'cat-shopping', name: 'Shopping', icon: 'shopping-bag', color: '#EC4899' },
  { id: 'cat-health', name: 'Health', icon: 'heart', color: '#F43F5E' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'gamepad-2', color: '#8B5CF6' },
  { id: 'cat-others-exp', name: 'Others', icon: 'more-horizontal', color: '#64748B' }
];

export default function QuickAddAndHistory({
  recentTransactions = [],
  onTransactionAdded,
  currency = 'INR'
}) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('cat-food');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyMethodFilter, setHistoryMethodFilter] = useState('All');
  const fileInputRef = useRef(null);

  // Quick Keypad Add
  const handleAddDigit = (val) => {
    if (val === 'clear') {
      setAmount('');
    } else {
      if (val === '.' && amount.includes('.')) return;
      if (amount.length > 8) return;
      setAmount((prev) => prev + val);
    }
  };

  // Receipt Scanner trigger
  const handleReceiptScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReceiptFile(file);
    setScanMessage('Scanning receipt...');

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const res = await api.post('/transactions/scan-receipt', formData, true);

      if (res.extracted) {
        setAmount(String(res.extracted.amount));
        if (res.extracted.category_id) {
          setSelectedCatId(res.extracted.category_id);
        }
        if (res.extracted.payment_method) {
          setPaymentMethod(res.extracted.payment_method);
        }
        setScanMessage(`✨ Scanned: ${res.extracted.title} (${res.extracted.amount})`);
        setTimeout(() => setScanMessage(''), 4000);
      }
    } catch (err) {
      setScanMessage('Could not parse receipt automatically.');
      setTimeout(() => setScanMessage(''), 3000);
    }
  };

  // Submit Quick Add Transaction
  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const catObj = QUICK_CATEGORIES.find((c) => c.id === selectedCatId) || QUICK_CATEGORIES[0];
      const formData = new FormData();
      formData.append('type', type);
      formData.append('amount', numAmount.toFixed(2));
      formData.append('title', catObj.name);
      formData.append('category', selectedCatId);
      formData.append('payment_method', paymentMethod);
      formData.append('date', new Date().toISOString().split('T')[0]);

      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await api.post('/transactions/', formData, true);

      // Reset form
      setAmount('');
      setReceiptFile(null);
      if (onTransactionAdded) onTransactionAdded();
    } catch (err) {
      alert(err.detail || 'Failed to add transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export filtered transactions
  const handleExport = async (format = 'csv') => {
    try {
      const blob = await api.download('/transactions/export', { format });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spendquest-transactions-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Export failed.');
    }
  };

  // Filter history
  const filteredHistory = (recentTransactions || []).filter((tx) => {
    if (historySearch) {
      const q = historySearch.toLowerCase();
      const matchTitle = tx.title?.toLowerCase().includes(q);
      const matchCat = tx.category?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchCat) return false;
    }
    if (historyMethodFilter !== 'All') {
      if (!tx.payment_method?.toLowerCase().includes(historyMethodFilter.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Part: Quick Add Transaction */}
      <div className="glass-card rounded-3xl p-5 shadow-card bg-white/75">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-extrabold text-base text-pastel-dark flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                <Zap size={13} fill="currentColor" />
              </span>
              <span>Add Transaction</span>
            </h3>
            <p className="text-[11px] font-semibold text-pastel-muted">
              Quickly add your expense or income
            </p>
          </div>
        </div>

        {/* Expense vs Income Toggle Pills */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-pastel-lavender/40 rounded-2xl my-3">
          <button
            onClick={() => setType('expense')}
            className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              type === 'expense'
                ? 'bg-pastel-purple text-white shadow-md'
                : 'text-pastel-dark/70 hover:text-pastel-dark'
            }`}
          >
            <ArrowDown size={14} strokeWidth={3} />
            <span>Expense</span>
          </button>
          <button
            onClick={() => setType('income')}
            className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              type === 'income'
                ? 'bg-pastel-mint-dark text-white shadow-md'
                : 'text-pastel-dark/70 hover:text-pastel-dark'
            }`}
          >
            <ArrowUp size={14} strokeWidth={3} />
            <span>Income</span>
          </button>
        </div>

        {/* Amount Input Box */}
        <div className="my-3 p-3 rounded-2xl bg-white border border-purple-100 flex items-center justify-between shadow-sm">
          <div className="flex items-baseline gap-1 text-2xl font-black text-pastel-dark">
            <span className="text-xl text-pastel-purple">₹</span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className="w-full bg-transparent outline-none text-2xl font-black text-pastel-dark placeholder:text-gray-300"
            />
          </div>
          {amount && (
            <button
              onClick={() => setAmount('')}
              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Icon Grid */}
        <div className="grid grid-cols-4 gap-2 my-3">
          {QUICK_CATEGORIES.map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-pastel-purple/20 ring-2 ring-pastel-purple scale-105'
                    : 'bg-white/80 hover:bg-pastel-lavender/40 border border-purple-50'
                }`}
              >
                <CategoryIconBadge
                  icon={cat.icon}
                  color={cat.color}
                  size={16}
                  className="w-8 h-8"
                />
                <span className="text-[10px] font-bold text-pastel-dark mt-1 truncate max-w-full">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scan Receipt Button & Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleReceiptScan}
          accept="image/*,application/pdf"
          className="hidden"
        />

        <div className="flex items-center justify-between gap-2 my-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-pastel-lavender/50 hover:bg-pastel-lavender/80 border border-purple-100 text-xs font-bold text-pastel-dark transition"
          >
            <Camera size={14} className="text-pastel-purple" />
            <span>{receiptFile ? 'Receipt Attached ✓' : 'Scan Receipt (Optional)'}</span>
          </button>

          {/* Quick Payment Method Selector */}
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="px-2.5 py-2 rounded-xl bg-white border border-purple-100 text-xs font-bold text-pastel-dark outline-none cursor-pointer"
          >
            <option value="UPI">UPI</option>
            <option value="Credit Card">Card</option>
            <option value="Debit Card">Debit</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank</option>
          </select>
        </div>

        {scanMessage && (
          <p className="text-[11px] font-bold text-pastel-purple text-center mb-2 animate-pulse">
            {scanMessage}
          </p>
        )}

        {/* Add Transaction Primary Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white font-extrabold text-sm shadow-floating flex items-center justify-center gap-2 transition-all transform active:scale-98"
        >
          <span>{isSubmitting ? 'Adding...' : 'Add Transaction'}</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Part: Transaction History */}
      <div className="glass-card rounded-3xl p-5 shadow-card bg-white/75 space-y-3">
        {/* Header with Export icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pastel-lavender/60 flex items-center justify-center text-pastel-purple">
              <Clock size={16} />
            </div>
            <h3 className="font-extrabold text-base text-pastel-dark">
              Transaction History
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleExport('csv')}
              title="Download CSV"
              className="p-1.5 rounded-xl hover:bg-pastel-lavender/60 text-pastel-muted hover:text-pastel-dark transition"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              title="Download Excel"
              className="p-1.5 rounded-xl hover:bg-pastel-lavender/60 text-emerald-600 transition"
            >
              <FileSpreadsheet size={16} />
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-pastel-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-pastel-lavender/30 border border-purple-100 text-xs text-pastel-dark outline-none placeholder:text-pastel-muted"
          />
        </div>

        {/* Filter pills: All, Card, UPI, Cash */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
          {['All', 'Card', 'UPI', 'Cash'].map((f) => (
            <button
              key={f}
              onClick={() => setHistoryMethodFilter(f)}
              className={`px-2.5 py-1 rounded-full transition ${
                historyMethodFilter === f
                  ? 'bg-pastel-purple text-white shadow-sm'
                  : 'bg-white border border-purple-100 text-pastel-dark/70 hover:bg-purple-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grouped Transactions List */}
        <div className="space-y-2 pt-1 max-h-[300px] overflow-y-auto pr-1">
          {filteredHistory.length === 0 ? (
            <p className="text-center text-xs text-pastel-muted py-4">
              No transactions found.
            </p>
          ) : (
            filteredHistory.map((tx) => {
              const isIncome = tx.type === 'income';
              const sign = isIncome ? '+' : '-';
              const amountColor = isIncome ? 'text-emerald-600 font-extrabold' : 'text-pink-600 font-extrabold';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-purple-50/50 transition border border-transparent hover:border-purple-100"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CategoryIconBadge
                      icon={tx.category?.icon || 'tag'}
                      color={tx.category?.color || '#A78BFA'}
                      size={15}
                      className="w-8 h-8 shrink-0"
                    />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-pastel-dark truncate">
                        {tx.title}
                      </h4>
                      <p className="text-[10px] font-medium text-pastel-muted">
                        {formatDateRelative(tx.date)} • {tx.payment_method}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs ml-2 shrink-0 ${amountColor}`}>
                    {sign}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
