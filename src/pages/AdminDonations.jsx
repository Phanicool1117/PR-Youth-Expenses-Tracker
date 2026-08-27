import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { triggerHaptic, playSuccessSound } from '../utils/hapticsSound';
import { CustomDatePicker } from '../components/ui/CustomDatePicker';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Toast } from '../components/ui/Toast';
import { Navbar } from '../components/Navbar';
import { HeartHandshake, User, Loader2, CheckCircle2 } from 'lucide-react';

export function AdminDonations() {
  const { user, triggerRefresh } = useAuth();
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic(15);

    const numericAmount = Number(amount);

    if (!donorName.trim()) {
      setToastMessage({ type: 'error', text: 'Please enter donor name.' });
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setToastMessage({ type: 'error', text: 'Please enter a valid positive donation amount.' });
      return;
    }

    setSubmitting(true);
    setToastMessage(null);

    try {
      const payload = {
        memberId: user?.memberId || 'ADM000',
        memberName: user?.name || 'Admin',
        donorName: donorName.trim(),
        name: donorName.trim(),
        donor: donorName.trim(),
        amount: numericAmount,
        date: date || new Date().toISOString().split('T')[0],
        paymentMethod: paymentMode,
        paymentMode: paymentMode,
        notes: notes.trim(),
        note: notes.trim(),
      };

      const res = await api.addDonation(payload);

      if (res.success) {
        setIsSuccessState(true);
        triggerHaptic([30, 50, 30]);
        playSuccessSound();

        setToastMessage({
          type: 'success',
          text: `₹${numericAmount.toLocaleString('en-IN')} donation from "${donorName.trim()}" logged!`,
        });
        setDonorName('');
        setAmount('');
        setNotes('');
        triggerRefresh();

        setTimeout(() => {
          setIsSuccessState(false);
        }, 1000);
      } else {
        setToastMessage({
          type: 'error',
          text: res.message || 'Failed to record donation. Check required fields.',
        });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const paymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'QR Code', label: 'QR Code' },
    { value: 'UPI Transfer', label: 'UPI Transfer' },
    { value: 'Bank Deposit', label: 'Bank Deposit' },
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

      {/* Clean Centered Title (No underline, no tagline) */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight flex items-center justify-center gap-2">
          <HeartHandshake className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>Donations Portal</span>
        </h1>
      </div>

      {/* Segmented Navigation Tab Bar */}
      <Navbar />

      {/* Form Card */}
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
          {/* Donor Name Field */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
              Donor Name <span className="text-rose-500">*</span>
            </label>
            <div className="apple-input-wrapper">
              <User className="apple-input-icon text-emerald-600" />
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. Ramesh Varma or Manav"
                className="apple-input apple-input-with-icon font-semibold text-xs py-3 text-[#0f172a]"
                required
              />
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
              Donation Amount (₹) <span className="text-rose-500">*</span>
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
              />
            </div>
          </div>

          {/* Date & Payment Mode Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Date Received <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                value={date}
                onChange={(isoDate) => setDate(isoDate)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Mode of Payment
              </label>
              <CustomSelect
                value={paymentMode}
                onChange={(val) => setPaymentMode(val)}
                options={paymentModeOptions}
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
              Reference Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent via QR Code on banner"
              className="apple-input text-xs py-3"
            />
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
              <span>Record Central Donation</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
