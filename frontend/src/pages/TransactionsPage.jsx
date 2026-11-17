import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDateRelative } from '../utils/formatters';
import { CategoryIconBadge } from '../components/common/IconHelper';
import TransactionModal from '../components/transactions/TransactionModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

export default function TransactionsPage() {
  const { currency } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL params per FR-6.4
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const typeParam = searchParams.get('type') || 'all';
  const startDateParam = searchParams.get('start_date') || '';
  const endDateParam = searchParams.get('end_date') || '';
  const orderingParam = searchParams.get('ordering') || '-date';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewReceiptUrl, setViewReceiptUrl] = useState(null);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach((key) => {
      if (newParams[key] === '' || newParams[key] === 'all') {
        updated.delete(key);
      } else {
        updated.set(key, newParams[key]);
      }
    });
    // Reset to page 1 on filter change if page wasn't explicitly changed
    if (!newParams.page) updated.delete('page');
    setSearchParams(updated);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [txRes, catRes] = await Promise.all([
        api.get('/transactions/', {
          search: searchParam,
          category: categoryParam !== 'all' ? categoryParam : '',
          type: typeParam !== 'all' ? typeParam : '',
          start_date: startDateParam,
          end_date: endDateParam,
          ordering: orderingParam,
          page: pageParam,
          page_size: 20
        }),
        api.get('/categories/')
      ]);

      setTransactions(txRes.results || []);
      setTotalCount(txRes.count || 0);
      setCategories(catRes || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/transactions/${deleteTargetId}/`);
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      loadData();
    } catch (err) {
      alert(err.detail || 'Failed to delete transaction.');
    }
  };

  const handleExport = async (format) => {
    try {
      const blob = await api.download('/transactions/export/', {
        format,
        search: searchParam,
        category: categoryParam !== 'all' ? categoryParam : '',
        type: typeParam !== 'all' ? typeParam : '',
        start_date: startDateParam,
        end_date: endDateParam
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spendquest-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Export failed. Please try again.');
    }
  };

  const totalPages = Math.ceil(totalCount / 20) || 1;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-pastel-dark tracking-tight">
            Transactions
          </h2>
          <p className="text-xs md:text-sm font-bold text-pastel-muted mt-1">
            Manage, filter, and export your personal expense and income records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Buttons */}
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-pastel-lavender/40 border border-purple-100 text-xs font-bold text-pastel-dark shadow-sm transition"
          >
            <Download size={15} />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-pastel-lavender/40 border border-purple-100 text-xs font-bold text-emerald-700 shadow-sm transition"
          >
            <FileSpreadsheet size={15} />
            <span>Excel</span>
          </button>

          {/* New Transaction Button */}
          <button
            onClick={() => {
              setSelectedTx(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-extrabold shadow-floating transition-transform active:scale-95"
          >
            <Plus size={16} strokeWidth={2.8} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-3xl p-4 shadow-card bg-white/75 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-pastel-muted" />
            <input
              type="text"
              placeholder="Search title or description..."
              value={searchParam}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 pr-3 py-2 rounded-2xl bg-pastel-lavender/25 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeParam}
              onChange={(e) => updateFilters({ type: e.target.value })}
              className="w-full px-3 py-2 rounded-2xl bg-pastel-lavender/25 border border-purple-100 text-xs font-bold text-pastel-dark outline-none cursor-pointer"
            >
              <option value="all">All Types (Income & Expense)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryParam}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="w-full px-3 py-2 rounded-2xl bg-pastel-lavender/25 border border-purple-100 text-xs font-bold text-pastel-dark outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Filter */}
          <div>
            <select
              value={orderingParam}
              onChange={(e) => updateFilters({ ordering: e.target.value })}
              className="w-full px-3 py-2 rounded-2xl bg-pastel-lavender/25 border border-purple-100 text-xs font-bold text-pastel-dark outline-none cursor-pointer"
            >
              <option value="-date">Date: Newest First</option>
              <option value="date">Date: Oldest First</option>
              <option value="-amount">Amount: Highest First</option>
              <option value="amount">Amount: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-purple-50 text-xs font-bold">
          <span className="text-pastel-muted">Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDateParam}
              onChange={(e) => updateFilters({ start_date: e.target.value })}
              className="px-2.5 py-1 rounded-xl bg-pastel-lavender/25 border border-purple-100 text-xs font-bold text-pastel-dark outline-none"
            />
            <span className="text-pastel-muted">to</span>
            <input
              type="date"
              value={endDateParam}
              onChange={(e) => updateFilters({ end_date: e.target.value })}
              className="px-2.5 py-1 rounded-xl bg-pastel-lavender/25 border border-purple-100 text-xs font-bold text-pastel-dark outline-none"
            />
          </div>

          {(searchParam || categoryParam !== 'all' || typeParam !== 'all' || startDateParam || endDateParam) && (
            <button
              onClick={() => setSearchParams({})}
              className="ml-auto text-xs font-bold text-pastel-purple hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-card bg-white/75">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-pastel-lavender/40 border-b border-purple-100 text-[11px] font-black uppercase tracking-wider text-pastel-dark/70">
                <th className="py-3.5 px-4">Transaction / Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Receipt</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-xs font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-pastel-muted">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <p className="text-pastel-muted font-bold text-sm">No transactions found.</p>
                    <p className="text-pastel-muted/70 text-xs mt-1">
                      Try adjusting filters or add a new transaction.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const sign = isIncome ? '+' : '-';
                  const amountColor = isIncome ? 'text-emerald-600 font-extrabold' : 'text-pink-600 font-extrabold';

                  return (
                    <tr key={tx.id} className="hover:bg-purple-50/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <CategoryIconBadge
                            icon={tx.category?.icon || 'tag'}
                            color={tx.category?.color || '#A78BFA'}
                            size={16}
                            className="w-9 h-9 shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-pastel-dark">{tx.title}</p>
                            <span className="text-[10px] text-pastel-muted font-bold">
                              {tx.category?.name}
                            </span>
                            {tx.description && (
                              <p className="text-[10px] text-gray-400 truncate max-w-xs">
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-pastel-muted text-xs font-bold">
                        {tx.date}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-pastel-lavender/50 text-pastel-dark text-[11px] font-bold">
                          {tx.payment_method}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {tx.receipt ? (
                          <button
                            onClick={() => setViewReceiptUrl(`http://localhost:5001${tx.receipt}`)}
                            className="flex items-center gap-1 text-[11px] font-bold text-pastel-purple hover:underline"
                          >
                            <FileText size={14} />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-gray-300 text-[11px]">—</span>
                        )}
                      </td>

                      <td className={`py-3.5 px-4 text-right text-sm ${amountColor}`}>
                        {sign}{formatCurrency(tx.amount, currency)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedTx(tx);
                              setIsModalOpen(true);
                            }}
                            title="Edit"
                            className="p-1.5 rounded-xl hover:bg-pastel-lavender/60 text-pastel-dark transition"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTargetId(tx.id);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Delete"
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (FR-2.5) */}
        <div className="flex items-center justify-between p-4 border-t border-purple-50 text-xs font-bold text-pastel-muted">
          <span>
            Showing {transactions.length} of {totalCount} records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateFilters({ page: pageParam - 1 })}
              disabled={pageParam <= 1}
              className="p-1.5 rounded-xl border border-purple-100 disabled:opacity-40 hover:bg-purple-50 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-pastel-dark font-extrabold px-2">
              Page {pageParam} of {totalPages}
            </span>
            <button
              onClick={() => updateFilters({ page: pageParam + 1 })}
              disabled={pageParam >= totalPages}
              className="p-1.5 rounded-xl border border-purple-100 disabled:opacity-40 hover:bg-purple-50 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadData}
        initialData={selectedTx}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? Your balance and budgets will automatically update."
      />

      {/* Receipt Preview Lightbox */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-xl max-h-[85vh] bg-white rounded-3xl p-4 overflow-hidden">
            <button
              onClick={() => setViewReceiptUrl(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white"
            >
              ✕
            </button>
            <img
              src={viewReceiptUrl}
              alt="Receipt Attachment"
              className="max-h-[75vh] w-auto mx-auto rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
