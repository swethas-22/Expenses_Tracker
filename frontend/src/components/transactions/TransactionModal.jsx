import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera, FileText, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Other'];

export default function TransactionModal({
  isOpen,
  onClose,
  onSaved,
  initialData = null,
  categories = []
}) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory(
        typeof initialData.category === 'object' && initialData.category !== null
          ? initialData.category.id
          : initialData.category || ''
      );
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(initialData.payment_method || 'UPI');
      setReceiptPreview(initialData.receipt ? `http://localhost:5001${initialData.receipt}` : null);
      setReceiptFile(null);
    } else {
      setType('expense');
      setAmount('');
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setReceiptFile(null);
      setReceiptPreview(null);
      // Auto-select first matching category
      const filtered = categories.filter((c) => c.type === 'expense');
      if (filtered.length > 0) setCategory(filtered[0].id);
    }
    setErrors({});
  }, [initialData, isOpen, categories]);

  // Adjust category when type changes to maintain compatibility (FR-2.10)
  useEffect(() => {
    const available = categories.filter((c) => c.type === type);
    if (!available.some((c) => c.id === category)) {
      if (available.length > 0) setCategory(available[0].id);
      else setCategory('');
    }
  }, [type, categories]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ receipt: ['Receipt file cannot exceed 5 MB.'] });
        return;
      }
      setReceiptFile(file);
      if (file.type.startsWith('image/')) {
        setReceiptPreview(URL.createObjectURL(file));
      } else {
        setReceiptPreview('pdf');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrors({ amount: ['Ensure this value is greater than 0.'] });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('type', type);
    formData.append('amount', numAmount.toFixed(2));
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('date', date);
    formData.append('payment_method', paymentMethod);

    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }

    try {
      if (initialData?.id) {
        await api.patch(`/transactions/${initialData.id}/`, formData, true);
      } else {
        await api.post('/transactions/', formData, true);
      }
      onSaved();
      onClose();
    } catch (err) {
      if (typeof err === 'object') {
        setErrors(err);
      } else {
        setErrors({ general: ['Failed to save transaction.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pastel-dark/30 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-floating border border-purple-100 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-purple-50">
          <h3 className="font-extrabold text-lg text-pastel-dark">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        {errors.detail && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {errors.detail}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-pastel-lavender/40 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-xl text-xs font-extrabold transition ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-pastel-dark/70 hover:text-pastel-dark'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-xl text-xs font-extrabold transition ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-pastel-dark/70 hover:text-pastel-dark'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-sm font-black text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              />
              {errors.amount && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.amount[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              />
              {errors.date && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.date[0]}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Title / Merchant *
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly groceries or Client project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
            {errors.title && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.title[0]}</p>
            )}
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.category[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Description */}
          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Description (Optional, max 500 chars)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="Add optional notes, invoice ID, or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
            />
          </div>

          {/* Receipt Attachment (FR-2.4) */}
          <div>
            <label className="block text-xs font-bold text-pastel-dark mb-1">
              Receipt Attachment (Optional, max 5 MB)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pastel-lavender/50 hover:bg-pastel-lavender border border-purple-100 text-xs font-bold text-pastel-purple transition"
              >
                <Camera size={16} />
                <span>{receiptFile || receiptPreview ? 'Change Receipt' : 'Upload Receipt'}</span>
              </button>

              {receiptPreview && (
                <div className="flex items-center gap-2">
                  {receiptPreview === 'pdf' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-xs font-bold text-pastel-dark">
                      <FileText size={16} className="text-pastel-purple" />
                      <span>PDF Attached</span>
                    </div>
                  ) : (
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="w-10 h-10 object-cover rounded-xl border border-purple-200"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptFile(null);
                      setReceiptPreview(null);
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
            {errors.receipt && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.receipt[0]}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-purple-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-pastel-dark text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-bold shadow-md shadow-purple-200 transition"
            >
              {loading ? 'Saving...' : initialData ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
