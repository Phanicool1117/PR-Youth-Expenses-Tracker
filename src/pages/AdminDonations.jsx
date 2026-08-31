import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { triggerHaptic, playSuccessSound } from '../utils/hapticsSound';
import { CustomDatePicker } from '../components/ui/CustomDatePicker';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Toast } from '../components/ui/Toast';
import { Navbar } from '../components/Navbar';
import { LadduIcon } from '../components/ui/LadduIcon';
import {
  HandCoins,
  User,
  Loader2,
  CheckCircle2,
  Banknote,
  QrCode,
  Smartphone,
  Building2,
  Award,
  Sparkles,
  FileText,
} from 'lucide-react';

export function AdminDonations() {
  const { user, triggerRefresh } = useAuth();
  
  // In-Page Sub-Section Toggle State ('chanda' | 'laddu')
  const [activeSection, setActiveSection] = useState('chanda');

  // Chanda Form State
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');

  // Laddu Form State
  const [ladduWinnerName, setLadduWinnerName] = useState('');
  const [ladduAmount, setLadduAmount] = useState('');
  const [ladduDate, setLadduDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [ladduPaymentMode, setLadduPaymentMode] = useState('Cash');
  const [ladduNotes, setLadduNotes] = useState('Sri Vinayaka 2026 Laddu Auction Winner');
  const [gender, setGender] = useState('Male'); // 'Male' | 'Female'

  const [submitting, setSubmitting] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const isLaddu = activeSection === 'laddu';

  const paymentModeOptions = [
    { value: 'Cash', label: 'Cash', icon: Banknote },
    { value: 'QR Code', label: 'QR Code', icon: QrCode },
    { value: 'UPI Transfer', label: 'UPI Transfer', icon: Smartphone },
    { value: 'Bank Deposit', label: 'Bank Deposit', icon: Building2 },
  ];

  // Submit Handler for Chanda (General Donations)
  const handleChandaSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic(15);

    const numericAmount = Number(amount);

    if (!donorName.trim()) {
      setToastMessage({ type: 'error', text: 'Please enter the donor’s name.' });
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
        memberId: user.memberId,
        memberName: user.name,
        donorName: donorName.trim(),
        amount: numericAmount,
        paymentMethod: paymentMode,
        date,
        notes: '',
        subType: '',
        gender: '',
        titlePrefix: 'Mr/Miss:',
      };

      const res = await api.addDonation(payload);

      if (res.success) {
        setIsSuccessState(true);
        triggerHaptic([30, 50, 30]);
        playSuccessSound();

        setToastMessage({
          type: 'success',
          text: `₹${numericAmount.toLocaleString('en-IN')} Chanda donation from "${donorName.trim()}" logged!`,
        });
        setDonorName('');
        setAmount('');
        triggerRefresh();

        setTimeout(() => {
          setIsSuccessState(false);
        }, 1000);
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Failed to record donation.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Handler for Laddu Auction
  const handleLadduSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic(15);

    const numericAmount = Number(ladduAmount);

    if (!ladduWinnerName.trim()) {
      setToastMessage({ type: 'error', text: 'Please enter the Laddu auction winner name.' });
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setToastMessage({ type: 'error', text: 'Please enter a valid auction winning amount.' });
      return;
    }

    setSubmitting(true);
    setToastMessage(null);

    try {
      const titlePrefix = gender === 'Female' ? 'Ms.' : 'Mr.';
      const payload = {
        memberId: user.memberId,
        memberName: user.name,
        donorName: ladduWinnerName.trim(),
        amount: numericAmount,
        paymentMethod: ladduPaymentMode,
        date: ladduDate,
        notes: ladduNotes.trim(),
        subType: 'Laddu',
        gender: gender,
        titlePrefix: titlePrefix,
      };

      const res = await api.addDonation(payload);

      if (res.success) {
        setIsSuccessState(true);
        triggerHaptic([30, 50, 30]);
        playSuccessSound();

        setToastMessage({
          type: 'success',
          text: `🎉 ₹${numericAmount.toLocaleString('en-IN')} Laddu Auction Winner "${titlePrefix} ${ladduWinnerName.trim()}" recorded!`,
        });
        setLadduWinnerName('');
        setLadduAmount('');
        triggerRefresh();

        setTimeout(() => {
          setIsSuccessState(false);
        }, 1000);
      } else {
        setToastMessage({ type: 'error', text: res.message || 'Failed to record Laddu winner.' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

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
          {isLaddu ? (
            <>
              <LadduIcon className="w-7 h-7 text-amber-600 shrink-0" />
              <span>Laddu Auction Portal</span>
            </>
          ) : (
            <>
              <HandCoins className="w-7 h-7 text-emerald-600 shrink-0" />
              <span>Donations & Chanda</span>
            </>
          )}
        </h1>
      </div>

      {/* Primary Top Tab Bar */}
      <Navbar />

      {/* In-Page Direct Section Toggle Pill (Chanda Portal vs Laddu Auction) */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-200/90 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-inner border border-slate-300/60 max-w-sm w-full">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(12);
              setActiveSection('chanda');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
              !isLaddu
                ? 'bg-white text-emerald-700 shadow-md ring-1 ring-black/5 scale-[1.01]'
                : 'text-slate-600 hover:text-[#0f172a]'
            }`}
          >
            <HandCoins className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Chanda Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(12);
              setActiveSection('laddu');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
              isLaddu
                ? 'bg-white text-amber-700 shadow-md ring-1 ring-black/5 scale-[1.01]'
                : 'text-slate-600 hover:text-[#0f172a]'
            }`}
          >
            <LadduIcon className="w-4 h-4 shrink-0" />
            <span>Laddu Auction</span>
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="reference-card p-6 space-y-5">
        {toastMessage && (
          <Toast
            message={toastMessage.text}
            type={toastMessage.type}
            onClose={() => setToastMessage(null)}
            autoHideDuration={1500}
          />
        )}

        {/* ========================================================================= */}
        {/* 1. CHANDA (GENERAL DONATIONS) FORM                                        */}
        {/* ========================================================================= */}
        {!isLaddu ? (
          <form onSubmit={handleChandaSubmit} className="space-y-5 animate-fade-in">
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
                  placeholder="e.g. Ramesh Varma or Suresh"
                  className="apple-input apple-input-with-icon font-semibold text-xs py-3"
                  required
                />
              </div>
            </div>

            {/* Donation Amount Field (Perfect Center Baseline Alignment) */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Donation Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center bg-[#f1f5f9] rounded-2xl px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071e3] transition-all border border-slate-200/50">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 select-none mr-2 leading-none shrink-0">
                  ₹
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent border-0 text-xl sm:text-2xl font-extrabold text-[#0f172a] placeholder:text-slate-300 focus:outline-none tracking-tight py-0.5"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || isSuccessState}
              className={`w-full py-4 rounded-2xl shadow-md transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                isSuccessState
                  ? 'bg-emerald-600 text-white scale-[1.01] shadow-emerald-500/25'
                  : submitting
                  ? 'bg-emerald-600 text-white cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              }`}
            >
              {submitting && !isSuccessState ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging Donation...</span>
                </>
              ) : isSuccessState ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Chanda Donation Recorded!</span>
                </>
              ) : (
                <span>Record Chanda Donation</span>
              )}
            </button>
          </form>
        ) : (
          /* ========================================================================= */
          /* 2. LADDU AUCTION PRASADAM FORM                                            */
          /* ========================================================================= */
          <form onSubmit={handleLadduSubmit} className="space-y-5 animate-fade-in">
            {/* 1. GENDER SELECTION (Mr. vs Ms.) - Clean Text Without Emojis */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-2">
                Winner Title / Gender <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(12);
                    setGender('Male');
                  }}
                  className={`py-3 px-4 rounded-2xl border transition-all flex items-center justify-center font-extrabold text-xs cursor-pointer select-none ${
                    gender === 'Male'
                      ? 'bg-blue-50 border-[#0f52ba] text-[#0f52ba] shadow-sm ring-2 ring-[#0f52ba]/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Male (Mr.)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(12);
                    setGender('Female');
                  }}
                  className={`py-3 px-4 rounded-2xl border transition-all flex items-center justify-center font-extrabold text-xs cursor-pointer select-none ${
                    gender === 'Female'
                      ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm ring-2 ring-pink-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Female (Ms.)</span>
                </button>
              </div>
            </div>

            {/* 2. Winner Devotee Name */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Winner Name (Laddu Devotee) <span className="text-rose-500">*</span>
              </label>
              <div className="apple-input-wrapper">
                <Award className="apple-input-icon text-amber-500" />
                <input
                  type="text"
                  value={ladduWinnerName}
                  onChange={(e) => setLadduWinnerName(e.target.value)}
                  placeholder="e.g. Prasad Varma / Lakshmi Devi"
                  className="apple-input apple-input-with-icon font-semibold text-xs py-3"
                  required
                />
              </div>
            </div>

            {/* 3. Winning / Auction Amount (Perfect Center Baseline Alignment) */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Auction Winning Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center bg-[#f1f5f9] rounded-2xl px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500 transition-all border border-slate-200/50">
                <span className="text-xl sm:text-2xl font-extrabold text-amber-600 select-none mr-2 leading-none shrink-0">
                  ₹
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={ladduAmount}
                  onChange={(e) => setLadduAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent border-0 text-xl sm:text-2xl font-extrabold text-[#0f172a] placeholder:text-slate-300 focus:outline-none tracking-tight py-0.5"
                  required
                />
              </div>
            </div>

            {/* 4. Date & Mode of Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                  Date of Auction <span className="text-rose-500">*</span>
                </label>
                <CustomDatePicker
                  value={ladduDate}
                  onChange={(isoDate) => setLadduDate(isoDate)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                  Mode of Payment
                </label>
                <CustomSelect
                  value={ladduPaymentMode}
                  onChange={(val) => setLadduPaymentMode(val)}
                  options={paymentModeOptions}
                />
              </div>
            </div>

            {/* 5. Reference Notes */}
            <div>
              <label className="block text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Reference Notes
              </label>
              <div className="apple-input-wrapper">
                <Sparkles className="apple-input-icon text-amber-500" />
                <input
                  type="text"
                  value={ladduNotes}
                  onChange={(e) => setLadduNotes(e.target.value)}
                  placeholder="e.g. Sri Vinayaka 2026 Laddu Auction Winner"
                  className="apple-input apple-input-with-icon text-xs py-3"
                />
              </div>
            </div>

            {/* Submit Button for Laddu Auction - Clean Text Without Inner Icon */}
            <button
              type="submit"
              disabled={submitting || isSuccessState}
              className={`w-full py-4 rounded-2xl shadow-md transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                isSuccessState
                  ? 'bg-amber-600 text-white scale-[1.01] shadow-amber-500/25'
                  : submitting
                  ? 'bg-amber-600 text-white cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25'
              }`}
            >
              {submitting && !isSuccessState ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recording Laddu Winner...</span>
                </>
              ) : isSuccessState ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Laddu Winner Recorded!</span>
                </>
              ) : (
                <span>Record Laddu Winner</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
