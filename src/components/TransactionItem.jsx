import React from 'react';
import { ShoppingBag, Flame, Lightbulb, Flag, Flower2, Heart, Music, Utensils, Tag, Calendar, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function TransactionItem({ transaction, showMember = false }) {
  const isDonation = transaction.type === 'Donation' || Boolean(transaction.donorName);

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Category Icon & Color Palette
  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('travel')) return { icon: Tag, bg: 'bg-blue-50 text-blue-600 border-blue-200' };
    if (cat.includes('crackers')) return { icon: Flame, bg: 'bg-amber-50 text-amber-600 border-amber-200' };
    if (cat.includes('lights')) return { icon: Lightbulb, bg: 'bg-yellow-50 text-yellow-600 border-yellow-200' };
    if (cat.includes('banner')) return { icon: Flag, bg: 'bg-purple-50 text-purple-600 border-purple-200' };
    if (cat.includes('decoration')) return { icon: Flower2, bg: 'bg-pink-50 text-pink-600 border-pink-200' };
    if (cat.includes('pooja')) return { icon: Heart, bg: 'bg-rose-50 text-rose-600 border-rose-200' };
    if (cat.includes('dj')) return { icon: Music, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
    if (cat.includes('prasadam')) return { icon: Utensils, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    return { icon: ShoppingBag, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  const { icon: CategoryIcon, bg: categoryBg } = isDonation
    ? { icon: ArrowDownLeft, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
    : getCategoryIcon(transaction.category);

  const title = isDonation
    ? `Donation from ${transaction.donorName || 'Sponsor'}`
    : transaction.category || 'Expense Entry';

  return (
    <div className="apple-card p-3.5 sm:p-4 hover:border-[#0f52ba]/30 transition-all flex items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
      {/* Category Soft Square Icon & Info */}
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
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 truncate">
            {transaction.note && <span className="truncate max-w-[160px] sm:max-w-xs">{transaction.note}</span>}
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatDate(transaction.timestamp)}
            </span>
          </div>

          {showMember && transaction.memberName && (
            <div className="text-[11px] font-semibold text-[#0f52ba] flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{transaction.memberName} ({transaction.memberId})</span>
            </div>
          )}
        </div>
      </div>

      {/* Differentiated Color Amount Display: Red for Minus (-), Green for Plus (+) */}
      <div className="text-right shrink-0">
        <span
          className={`text-base sm:text-lg font-extrabold tracking-tight ${
            isDonation ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {isDonation ? '+ ' : '- '}₹{(Number(transaction.amount) || 0).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
