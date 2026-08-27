import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { triggerHaptic, playSuccessSound } from '../utils/hapticsSound';
import { ActivityLedger } from '../components/ActivityLedger';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Toast } from '../components/ui/Toast';
import { Navbar } from '../components/Navbar';
import { CreditCard, RefreshCw, Tag, LogOut, CheckCircle2, Loader2 } from 'lucide-react';

export function MemberDashboard() {
  const { user, logout, refreshTrigger, triggerRefresh, isSyncing } = useAuth();
  const [data, setData] = useState(() => {
    const cached = sessionStorage.getItem(`MEMBER_DASH_${user?.memberId}`);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!data);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Decoration Expenses');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadDashboard();
    loadCategories();
  }, [user, refreshTrigger]);

  const loadDashboard = async () => {
    if (!user) return;
    try {
      const res = await api.getMemberDashboard(user.memberId);
      if (res.success && res.data) {
        setData(res.data);
        sessionStorage.setItem(`MEMBER_DASH_${user.memberId}`, JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to load member dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic(15);

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setToastMessage({ type: 'error', text: 'Please enter a valid positive expense amount.' });
      return;
    }

    setSubmitting(true);
    setToastMessage(null);

    try {
      const payload = {
        memberId: user.memberId,
        memberName: user.name,
        amount: numericAmount,
        category,
        note: note.trim(),
        paymentMethod,
        date: new Date().toISOString().split('T')[0],
      };

      const res = await api.addExpense(payload);

      if (res.success) {
        setIsSuccessState(true);
        triggerHaptic([30, 50, 30]);
        playSuccessSound();

        setToastMessage({
          type: 'success',
          text: `₹${numericAmount.toLocaleString('en-IN')} expense recorded under "${category}"!`,
        });
        setAmount('');
        setNote('');
        triggerRefresh();

        setTimeout(() => {
          setIsSuccessState(false);
        }, 1000);
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Failed to submit expense.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="centered-container py-8 space-y-6">
        <div className="h-28 w-28 bg-slate-200/60 rounded-full mx-auto animate-pulse" />
        <div className="h-10 w-48 bg-slate-200/60 rounded-xl mx-auto animate-pulse" />
        <div className="h-12 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="h-24 bg-white rounded-3xl animate-pulse" />
      </div>
    );
  }

  const totalSpent = data?.totalExpenses || 0;
  const recentActivity = data?.recentActivity || [];

  const categoryOptions = categories.length > 0
    ? categories
    : [
        'Decoration Expenses',
        'Pooja Expenses',
        'Crackers Expenses',
        'Lights Expenses',
        'Travel Expenses',
        'Banner Expenses',
        'DJ Expenses',
        'Prasadam Expenses',
        'Other Expenses',
      ];

  return (
    <div className="centered-container py-6 sm:py-10 space-y-6">
      {/* Standalone Logo on Top */}
      <div className="flex items-center justify-center pt-2">
        <img
          src="/Logo.png"
          alt="PR Youth Logo"
          className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-md hover:scale-105 transition-transform"
        />
      </div>

      {/* Greeting Section (No underline, no tagline) */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Hi, {user.name}
        </h1>
      </div>

      {/* Segmented Tab Bar */}
      <Navbar />

      {/* Hierarchical Financial Status Bar */}
      <div className="reference-card rounded-3xl p-5 px-6 bg-gradient-to-br from-white via-slate-50/50 to-white shadow-sm border border-slate-200 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Total Expenses Spent</span>
          </div>

          <div className="text-[11px] font-medium text-slate-500 pt-0.5">
            Logged by {user.name} ({user.memberId})
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              triggerHaptic(15);
              triggerRefresh();
            }}
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors border border-emerald-200 active:scale-95 shadow-2xs"
            title="Sync live data"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              triggerHaptic(20);
              logout();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2.5 rounded-xl transition-all active:scale-95 shadow-2xs"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Primary Form Card */}
      <div className="reference-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0f52ba]" />
            Expense Check-in
          </h2>
          <span className="text-xs text-slate-400 font-medium">Quick Entry</span>
        </div>

        {toastMessage && (
          <Toast
            message={toastMessage.text}
            type={toastMessage.type}
            onClose={() => setToastMessage(null)}
            autoHideDuration={1200}
          />
        )}

        <form onSubmit={handleQuickSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">Select Category</label>
            <CustomSelect
              value={category}
              onChange={(val) => setCategory(val)}
              options={categoryOptions}
              icon={Tag}
              placeholder="Select Category"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">Expense Amount (₹)</label>
            <div className="apple-input-wrapper">
              <span className="apple-currency-prefix">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount paid..."
                className="apple-input apple-input-with-icon py-3 font-bold text-sm text-[#0f172a]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">
              Notes (items purchased, details, observations...)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Notes (treatment done, chemicals used, observations...)"
              className="apple-input text-xs py-2.5 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
              isSuccessState
                ? 'bg-emerald-600 text-white'
                : submitting
                ? 'bg-emerald-700 text-white cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : isSuccessState ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <span>Submit Expense Log</span>
            )}
          </button>
        </form>
      </div>

      {/* Activity Ledger */}
      <ActivityLedger
        transactions={recentActivity}
        showMember={false}
        title="My Activity History"
        categories={categories}
      />
    </div>
  );
}
