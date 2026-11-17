import React, { useState, useEffect } from 'react';
import { User, Shield, Tag, Plus, Trash2, Check, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CategoryIconBadge } from '../components/common/IconHelper';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (JPY)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: 'AU$', label: 'Australian Dollar (AUD)' }
];

const ICONS = ['utensils', 'shopping-cart', 'car', 'home', 'heart', 'gamepad-2', 'shopping-bag', 'wallet', 'laptop', 'trending-up', 'tag', 'coffee'];

export default function SettingsPage() {
  const { user, updateProfile, changePassword, logout } = useAuth();

  // Profile Form
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [profileMsg, setProfileMsg] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  // Category Manager
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatColor, setNewCatColor] = useState('#A78BFA');
  const [newCatIcon, setNewCatIcon] = useState('tag');
  const [catMsg, setCatMsg] = useState('');
  const [catErr, setCatErr] = useState('');
  const [deleteCatId, setDeleteCatId] = useState(null);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res || []);
    } catch (e) {}
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        currency
      });
      setProfileMsg('✓ Profile and currency updated successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      alert(err.detail || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErr('');
    setPasswordMsg('');
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg('✓ Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordErr(err.current_password?.[0] || err.new_password?.[0] || err.detail || 'Password change failed.');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCatErr('');
    try {
      await api.post('/categories/', {
        name: newCatName,
        type: newCatType,
        color: newCatColor,
        icon: newCatIcon
      });
      setNewCatName('');
      setCatMsg('✓ Category added.');
      setTimeout(() => setCatMsg(''), 3000);
      loadCategories();
    } catch (err) {
      setCatErr(err.name?.[0] || err.detail || 'Failed to create category.');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    try {
      await api.delete(`/categories/${deleteCatId}/`);
      setDeleteCatId(null);
      loadCategories();
    } catch (err) {
      alert(err.detail || 'Cannot delete category.');
      setDeleteCatId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-pastel-dark tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs md:text-sm font-bold text-pastel-muted mt-1">
          Manage your personal details, preferred currency, security credentials, and categories.
        </p>
      </div>

      {/* Profile & Currency Form */}
      <div className="glass-card rounded-3xl p-6 shadow-card bg-white/80">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-purple-50">
          <div className="w-10 h-10 rounded-2xl bg-pastel-lavender flex items-center justify-center text-pastel-purple">
            <User size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-pastel-dark">Profile Details & Currency</h3>
            <span className="text-xs font-semibold text-pastel-muted">
              Configure your name and ISO 4217 display currency
            </span>
          </div>
        </div>

        {profileMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold">
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">Preferred Currency (FR-1.9)</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-extrabold shadow-md shadow-purple-200 transition"
          >
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* Password Change Form (FR-1.10) */}
      <div className="glass-card rounded-3xl p-6 shadow-card bg-white/80">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-purple-50">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600">
            <Shield size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-pastel-dark">Security & Password</h3>
            <span className="text-xs font-semibold text-pastel-muted">
              Update your account password with current authentication confirmation
            </span>
          </div>
        </div>

        {passwordMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold">
            {passwordMsg}
          </div>
        )}
        {passwordErr && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 text-rose-800 text-xs font-bold">
            {passwordErr}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-pastel-dark mb-1">New Password (&gt;= 8 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-pastel-lavender/30 border border-purple-100 text-xs font-bold text-pastel-dark outline-none focus:ring-2 focus:ring-pastel-purple"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-extrabold shadow-md shadow-purple-200 transition"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Category Manager (FR-3.1 to FR-3.6) */}
      <div className="glass-card rounded-3xl p-6 shadow-card bg-white/80">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-purple-50">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Tag size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-pastel-dark">Category Manager</h3>
            <span className="text-xs font-semibold text-pastel-muted">
              Add custom categories with icons and pastel colors, or view seeded defaults
            </span>
          </div>
        </div>

        {catMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold">
            {catMsg}
          </div>
        )}
        {catErr && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 text-rose-800 text-xs font-bold">
            {catErr}
          </div>
        )}

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-pastel-lavender/20 border border-purple-100 mb-6 space-y-3">
          <h4 className="text-xs font-black text-pastel-dark uppercase">Create Custom Category</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-pastel-dark mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Pet Care"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-100 text-xs font-bold text-pastel-dark outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-pastel-dark mb-1">Type</label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-100 text-xs font-bold text-pastel-dark outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-pastel-dark mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-xl border border-purple-100 cursor-pointer"
                />
                <span className="text-xs font-bold text-pastel-muted">{newCatColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-pastel-dark mb-1">Icon</label>
              <select
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-purple-100 text-xs font-bold text-pastel-dark outline-none"
              >
                {ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-pastel-purple hover:bg-pastel-purple-dark text-white text-xs font-bold shadow-sm transition"
          >
            + Add Category
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-purple-50 shadow-sm"
            >
              <div className="flex items-center gap-2 truncate">
                <CategoryIconBadge icon={c.icon} color={c.color} size={15} className="w-8 h-8 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-xs text-pastel-dark truncate block">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-pastel-muted capitalize">
                    {c.type} {c.is_default && '• Default'}
                  </span>
                </div>
              </div>

              {!c.is_default && (
                <button
                  onClick={() => setDeleteCatId(c.id)}
                  className="p-1 text-rose-400 hover:text-rose-600 transition"
                  title="Delete category"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logout Action */}
      <div className="flex justify-end pt-2">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs transition border border-rose-100"
        >
          <LogOut size={16} />
          <span>Sign Out of SpendQuest</span>
        </button>
      </div>

      {/* Delete Category Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Custom Category"
        message="Are you sure you want to delete this custom category? If it is used by any transactions, you must reassign them first."
      />
    </div>
  );
}
