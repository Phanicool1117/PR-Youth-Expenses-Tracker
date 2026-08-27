import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { triggerHaptic, playSuccessSound } from '../utils/hapticsSound';
import { QuickAddCarousel } from '../components/QuickAddCarousel';
import { CustomDatePicker } from '../components/ui/CustomDatePicker';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Toast } from '../components/ui/Toast';
import { Navbar } from '../components/Navbar';
import { PlusCircle, FileText, User, CheckCircle2, Loader2 } from 'lucide-react';

export function AddExpense() {
  const { user, triggerRefresh } = useAuth();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Decoration Expenses');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0 && !res.data.includes(category)) {
          setCategory(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic(15);

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setToastMessage({ type: 'error', text: 'Please enter a valid positive expense amount.' });
      return;
    }

    if (!category) {
      setToastMessage({ type: 'error', text: 'Please select an expense category.' });
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
        date,
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
      setToastMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethodOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Card', label: 'Card' },
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

      {/* Clean Centered Title */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight flex items-center justify-center gap-2">
          <PlusCircle className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>Add Expenses</span>
        </h1>
      </div>

      {/* Segmented Tab Bar */}
      <Navbar />

      {/* Expense Form Card */}
      <div className="reference-card p-6 space-y-5">
        {toastMessage && (
          <Toast
            message={toastMessage.text}
            type={toastMessage.type}
            onClose={() => setToastMessage(null)}
            autoHideDuration={1200}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Paid By Field */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
              Paid By (Logged In Member)
            </label>
            <div className="apple-input-wrapper">
              <User className="apple-input-icon text-[#0f52ba]" />
              <input
                type="text"
                value={`${user.name} (${user.memberId})`}
                disabled
                className="apple-input apple-input-with-icon font-semibold text-xs bg-slate-100 text-[#0f172a] cursor-not-allowed"
              />
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
              Expense Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="apple-input-wrapper">
              <span className="apple-currency-prefix text-emerald-600">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="apple-input apple-input-with-icon text-2xl font-extrabold text-[#0f172a] py-3 tracking-tight"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Dynamic Category Carousel */}
          <QuickAddCarousel
            selectedCategory={category}
            categories={categories}
            onSelectCategory={(catName) => {
              triggerHaptic(10);
              setCategory(catName);
            }}
          />

          {/* Note Input */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
              Expense Note / Item Description
            </label>
            <div className="apple-input-wrapper">
              <FileText className="apple-input-icon" />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Water bottles & cans"
                className="apple-input apple-input-with-icon text-xs py-3"
              />
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                value={date}
                onChange={(isoDate) => setDate(isoDate)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <CustomSelect
                value={paymentMethod}
                onChange={(val) => setPaymentMethod(val)}
                options={paymentMethodOptions}
              />
            </div>
          </div>

          {/* Submit Button */}
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
              <span>Submit Expense</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
