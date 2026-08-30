import React, { useState, useMemo } from 'react';
import { TransactionItem } from './TransactionItem';
import { CustomSelect } from './ui/CustomSelect';
import { ExportModal } from './ExportModal';
import { triggerHaptic } from '../utils/hapticsSound';
import { Search, Filter, Download } from 'lucide-react';

export function ActivityLedger({
  transactions = [],
  showMember = false,
  showCategory = true,
  title = "Recent Activity",
  subtitle,
  categories = [],
  members = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMember, setSelectedMember] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const itemsPerPage = 10;

  // Filter Transactions based on Search, Category, Member with complete defensive guards
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter((tx) => {
      if (!tx) return false;
      const searchLower = searchTerm.toLowerCase().trim();
      const matchSearch =
        !searchLower ||
        (tx.category && String(tx.category).toLowerCase().includes(searchLower)) ||
        (tx.donorName && String(tx.donorName).toLowerCase().includes(searchLower)) ||
        (tx.name && String(tx.name).toLowerCase().includes(searchLower)) ||
        (tx.memberName && String(tx.memberName).toLowerCase().includes(searchLower)) ||
        (tx.memberId && String(tx.memberId).toLowerCase().includes(searchLower)) ||
        (tx.note && String(tx.note).toLowerCase().includes(searchLower));

      const matchCategory =
        !showCategory ||
        selectedCategory === 'All' ||
        tx.category === selectedCategory ||
        tx.type === selectedCategory ||
        tx.subType === selectedCategory ||
        (selectedCategory === 'Chanda' && (tx.subType === 'Chanda' || (!tx.subType && tx.category === 'Donation Received'))) ||
        (selectedCategory === 'Laddu Auction' && (tx.subType === 'Laddu' || tx.category === 'Laddu Prasadam Auction' || String(tx.note || '').toLowerCase().includes('laddu')));

      const matchMember =
        !showMember ||
        selectedMember === 'All' ||
        tx.memberId === selectedMember ||
        tx.memberName === selectedMember;

      return matchSearch && matchCategory && matchMember;
    });
  }, [transactions, searchTerm, selectedCategory, selectedMember, showCategory, showMember]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedMember]);

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Dynamically compute categoryOptions combining categories prop + transaction categories
  const categoryOptions = useMemo(() => {
    if (categories && (categories.includes('Chanda') || categories.includes('Laddu Auction'))) {
      return [
        { value: 'All', label: 'All Categories' },
        { value: 'Chanda', label: 'Chanda' },
        { value: 'Laddu Auction', label: 'Laddu Auction' },
      ];
    }

    const set = new Set();
    if (Array.isArray(categories)) {
      categories.forEach((c) => c && set.add(String(c)));
    }
    if (Array.isArray(transactions)) {
      transactions.forEach((tx) => tx && tx.category && set.add(String(tx.category)));
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

  // Exclude Admin from Members dropdown since Admin doesn't log expenses
  const memberOptions = useMemo(() => {
    if (!Array.isArray(members)) return [{ value: 'All', label: 'All Members' }];
    return [
      { value: 'All', label: 'All Members' },
      ...members
        .filter(Boolean)
        .filter((m) => {
          const id = String(m.memberId || '').toUpperCase();
          const name = String(m.name || '').toLowerCase();
          const role = String(m.role || '').toLowerCase();
          return id !== 'ADM000' && name !== 'admin' && role !== 'admin';
        })
        .map((m) => ({
          value: m.memberId || m.name || 'Member',
          label: `${m.name || 'Member'} (${m.memberId || 'ID'})`,
        })),
    ];
  }, [members]);

  return (
    <div className="reference-card p-6 space-y-4">
      {/* Header with Side-by-Side Export Option on all screen sizes */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 sm:pb-4">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-medium truncate">
            {subtitle || `Showing ${totalItems} recorded ${totalItems === 1 ? 'transaction' : 'transactions'}`}
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic(12);
            setIsExportOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs border border-slate-200 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-[#0f52ba]" />
          <span className="sm:hidden">Export</span>
          <span className="hidden sm:inline">Export Receipts</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
        {/* Search Field */}
        <div
          className={`relative ${
            showCategory && showMember
              ? 'sm:col-span-6'
              : showCategory || showMember
              ? 'sm:col-span-7 md:col-span-8'
              : 'sm:col-span-12'
          }`}
        >
          <Search className="apple-input-icon" />
          <input
            type="text"
            placeholder="Search notes, members, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apple-input apple-input-with-icon text-xs"
          />
        </div>

        {/* Category Filter (Shown only if showCategory is true) */}
        {showCategory && (
          <div className={showMember ? 'sm:col-span-3' : 'sm:col-span-5 md:col-span-4'}>
            <CustomSelect
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              icon={Filter}
              placeholder="All Categories"
            />
          </div>
        )}

        {/* Member Filter (Shown only if showMember is true) */}
        {showMember && (
          <div className={showCategory ? 'sm:col-span-3' : 'sm:col-span-5 md:col-span-4'}>
            <CustomSelect
              options={memberOptions}
              value={selectedMember}
              onChange={setSelectedMember}
              icon={Filter}
              placeholder="All Members"
            />
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-3 pt-2">
        {currentItems.length > 0 ? (
          currentItems.map((tx, idx) => (
            <TransactionItem
              key={tx.id || tx.timestamp || idx}
              transaction={tx}
              showMember={showMember}
              members={members}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-medium text-slate-500">
              {searchTerm || (showCategory && selectedCategory !== 'All') || (showMember && selectedMember !== 'All')
                ? 'No transactions found matching your search criteria.'
                : 'No transactions recorded yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                triggerHaptic(10);
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Export Receipts Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        transactions={filteredTransactions}
        title={title}
      />
    </div>
  );
}
