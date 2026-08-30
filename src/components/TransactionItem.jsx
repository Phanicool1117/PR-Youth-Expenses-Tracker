import React, { useMemo, useState } from 'react';
import { DonationReceiptModal } from './DonationReceiptModal';
import { triggerHaptic } from '../utils/hapticsSound';
import { getCategoryIconAndColor } from '../utils/categoryIcons';
import { formatCurrency, formatDate, formatDateTime, formatTime } from '../utils/formatters';
import {
  Calendar,
  User,
  HandHeart,
  Receipt,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  ShoppingBag,
  Tag,
} from 'lucide-react';

export function TransactionItem({ transaction, showMember = false, members = [] }) {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!transaction) return null;

  const isDonation =
    transaction.type === 'Donation' ||
    transaction.type === 'Donations' ||
    Boolean(transaction.donorName);

  const dateFormatted = formatDate(transaction.timestamp);
  const dateTimeFormatted = formatDateTime(transaction.timestamp);
  const timeFormatted = formatTime(transaction.timestamp);
  const amountFormatted = formatCurrency(transaction.amount);

  // Resolve live Member Name from Google Sheets Members tab by matching Member ID
  const resolvedMemberName = useMemo(() => {
    if (Array.isArray(members) && members.length > 0 && transaction.memberId) {
      const match = members.find(
        (m) =>
          m &&
          (String(m.memberId || '').toUpperCase() === String(transaction.memberId).toUpperCase() ||
           String(m.name || '').toUpperCase() === String(transaction.memberName || '').toUpperCase())
      );
      if (match && match.name) return match.name;
    }
    return transaction.memberName || 'Member';
  }, [members, transaction.memberId, transaction.memberName]);

  // Use the same unified Category Icon & Color mapping used in the member's category picker
  const itemStyle = isDonation
    ? { icon: HandHeart, color: 'bg-emerald-50 text-emerald-600 border-emerald-300' }
    : getCategoryIconAndColor(transaction.category);

  const CategoryIcon = itemStyle?.icon || ShoppingBag;
  const categoryBg = itemStyle?.color || 'bg-slate-100 text-slate-700 border-slate-300';

  const title = isDonation
    ? `Donation from ${transaction.donorName || 'Sponsor'}`
    : transaction.category || 'Expense Entry';

  const handleCardClick = () => {
    triggerHaptic(10);
    if (isDonation) {
      setIsReceiptModalOpen(true);
    } else {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`apple-card transition-all bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden cursor-pointer select-none ${
          isDonation
            ? 'hover:border-emerald-400 hover:shadow-sm active:scale-[0.99] group'
            : isExpanded
            ? 'border-blue-300 ring-1 ring-blue-100 shadow-xs'
            : 'hover:border-[#0f52ba]/40 hover:shadow-2xs active:scale-[0.99]'
        }`}
      >
        {/* ========================================================================= */}
        {/* 1. DONATIONS: Full Row with Badges, Notes, and Date                      */}
        {/* ========================================================================= */}
        {isDonation ? (
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${categoryBg}`}>
                <CategoryIcon className="w-5 h-5" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-[#0f172a] truncate">{title}</h4>
                  {transaction.paymentMethod && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {transaction.paymentMethod}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Receipt className="w-3 h-3" />
                    <span>Receipt</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 truncate">
                  {transaction.note && <span className="truncate max-w-[160px] sm:max-w-xs">{transaction.note}</span>}
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {dateTimeFormatted}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-base sm:text-lg font-extrabold text-emerald-600 tracking-tight">
                + ₹{amountFormatted}
              </span>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. EXPENSES: Ultra-Clean Minimal Row (Uniform Logo, Category & Amount)   */
          /* ========================================================================= */
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${categoryBg}`}>
                <CategoryIcon className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-[15px] text-[#0f172a] truncate">
                  {title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-base sm:text-lg font-extrabold text-rose-600 tracking-tight">
                - ₹{amountFormatted}
              </span>

              <div
                className={`p-1 rounded-full text-slate-400 hover:text-slate-600 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180 text-[#0f52ba] bg-blue-50' : ''
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Compact Inline Dropdown Details for Expenses ONLY                        */}
        {/* ========================================================================= */}
        {!isDonation && isExpanded && (
          <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 bg-slate-50/70 space-y-2.5 animate-fade-in text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              
              {/* Member Attribution */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0f52ba] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 block">Spent / Logged By</span>
                  <span className="font-bold text-[#0f172a] truncate block">
                    {resolvedMemberName} ({transaction.memberId || 'ID'})
                  </span>
                </div>
              </div>

              {/* Exact Date & Time */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 block">Date & Time</span>
                  <span className="font-bold text-[#0f172a] truncate block">
                    {dateFormatted} · {timeFormatted}
                  </span>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 block">Payment Method</span>
                  <span className="font-bold text-[#0f172a] truncate block">
                    {transaction.paymentMethod || 'Cash'}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 block">Category</span>
                  <span className="font-bold text-[#0f172a] truncate block">
                    {transaction.category || 'General Expense'}
                  </span>
                </div>
              </div>

            </div>

            {/* Note Section (Full, un-truncated) */}
            {transaction.note && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Expense Note / Purpose</span>
                </div>
                <p className="text-xs text-slate-800 font-medium leading-relaxed break-words whitespace-pre-wrap pl-5">
                  {transaction.note}
                </p>
              </div>
            )}

            <div className="text-center pt-0.5">
              <span className="text-[10px] font-semibold text-slate-400 hover:text-[#0f52ba] transition-colors">
                Tap card again to collapse
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Individual Donation Donor Receipt Modal (Only for Donations) */}
      {isDonation && (
        <DonationReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          donation={transaction}
        />
      )}
    </>
  );
}
