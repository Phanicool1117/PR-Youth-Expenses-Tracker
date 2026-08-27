import React, { useState, useMemo } from 'react';
import { TransactionItem } from './TransactionItem';
import { CustomSelect } from './ui/CustomSelect';
import { triggerHaptic } from '../utils/hapticsSound';
import { Search, Filter } from 'lucide-react';

export function ActivityLedger({
  transactions = [],
  showMember = false,
  title = "Recent Activity",
  subtitle,
  categories = [],
  members = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMember, setSelectedMember] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Transactions based on Search, Category, Member
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchSearch =
        !searchLower ||
        (tx.category && tx.category.toLowerCase().includes(searchLower)) ||
        (tx.donorName && tx.donorName.toLowerCase().includes(searchLower)) ||
        (tx.memberName && tx.memberName.toLowerCase().includes(searchLower)) ||
        (tx.memberId && tx.memberId.toLowerCase().includes(searchLower)) ||
        (tx.note && tx.note.toLowerCase().includes(searchLower));

      const matchCategory =
        selectedCategory === 'All' ||
        tx.category === selectedCategory ||
        tx.type === selectedCategory;

      const matchMember =
        selectedMember === 'All' ||
        tx.memberId === selectedMember ||
        tx.memberName === selectedMember;

      return matchSearch && matchCategory && matchMember;
    });
  }, [transactions, searchTerm, selectedCategory, selectedMember]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedMember]);

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Dynamically compute categoryOptions combining categories prop + transaction categories
  const categoryOptions = useMemo(() => {
    const set = new Set();
    if (Array.isArray(categories)) {
      categories.forEach((c) => c && set.add(c));
    }
    if (Array.isArray(transactions)) {
      transactions.forEach((tx) => tx.category && set.add(tx.category));
    }
    
    // Default categories fallback
    if (set.size === 0) {
      [
        'Decoration Expenses',
        'Pooja Expenses',
        'Crackers Expenses',
        'Lights Expenses',
        'Travel Expenses',
        'Banner Expenses',
        'DJ Expenses',
        'Prasadam Expenses',
        'Water Expenses',
        'Other Expenses'
      ].forEach((c) => set.add(c));
    }

    const catList = Array.from(set);
    return [
      { value: 'All', label: 'All Categories' },
      ...catList.map((c) => ({ value: c, label: c })),
    ];
  }, [categories, transactions]);

  const memberOptions = useMemo(() => {
    return [
      { value: 'All', label: 'All Members' },
      ...members.map((m) => ({ value: m.memberId || m.name, label: `${m.name} (${m.memberId || 'ID'})` })),
    ];
  }, [members]);

  return (
    <div className="reference-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-base font-bold text-[#0f172a]">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0f52ba] border border-blue-200">
          {totalItems} Entries
        </span>
      </div>

      {/* Filter Bar */}
      <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, category, notes..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-medium text-[#0f172a] placeholder:text-slate-400 focus:ring-2 focus:ring-[#0f52ba]/30 focus:border-[#0f52ba] outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <CustomSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={categoryOptions}
            placeholder="All Categories"
            icon={Filter}
          />

          {showMember && members.length > 0 && (
            <CustomSelect
              value={selectedMember}
              onChange={(val) => setSelectedMember(val)}
              options={memberOptions}
              placeholder="All Members"
            />
          )}
        </div>
      </div>

      {/* Transactions List */}
      {currentItems.length > 0 ? (
        <div className="space-y-2.5">
          {currentItems.map((tx, idx) => (
            <TransactionItem key={tx.id || idx} transaction={tx} showMember={showMember} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-1">
          <p className="text-xs font-semibold text-slate-500">No matching entries found.</p>
        </div>
      )}

      {/* Pagination Bar with Haptic Feedback */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
        <span className="text-xs text-slate-500 font-medium">
          {totalItems > 0
            ? `${startIndex + 1}–${Math.min(startIndex + itemsPerPage, totalItems)} of ${totalItems}`
            : '0 of 0'}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              triggerHaptic(12);
              setCurrentPage((prev) => Math.max(1, prev - 1));
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs active:scale-95"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => {
              triggerHaptic(12);
              setCurrentPage((prev) => Math.min(totalPages, prev + 1));
            }}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-blue-200 bg-white text-[#0f52ba] hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs active:scale-95"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
