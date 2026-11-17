import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message = 'Are you sure you want to permanently delete this item? This action cannot be undone.',
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pastel-dark/30 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-floating border border-rose-100 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-3">
          <AlertTriangle size={24} strokeWidth={2.5} />
        </div>
        <h3 className="text-base font-extrabold text-pastel-dark mb-1">{title}</h3>
        <p className="text-xs text-pastel-muted leading-relaxed mb-5">{message}</p>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-pastel-dark text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-200 transition"
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
