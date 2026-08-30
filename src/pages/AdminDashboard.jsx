import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { safeStorage } from '../utils/safeStorage';
import { triggerHaptic } from '../utils/hapticsSound';
import { ActivityLedger } from '../components/ActivityLedger';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Navbar } from '../components/Navbar';
import { Layers, RefreshCw, Wallet, LogOut, ChevronDown } from 'lucide-react';

export function AdminDashboard() {
  const { logout, refreshTrigger, triggerRefresh, isSyncing } = useAuth();
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  
  const [data, setData] = useState(() => {
    try {
      const cached = safeStorage.getSessionItem('ADMIN_DASH_DATA');
      return cached ? JSON.parse(cached) : {
        totalDonations: 0,
        totalExpenses: 0,
        currentBalance: 0,
        expenseCount: 0,
        categoryBreakdown: {},
        recentActivity: [],
      };
    } catch (e) {
      return {
        totalDonations: 0,
        totalExpenses: 0,
        currentBalance: 0,
        expenseCount: 0,
        categoryBreakdown: {},
        recentActivity: [],
      };
    }
  });

  const [members, setMembers] = useState(() => {
    try {
      const cached = safeStorage.getSessionItem('ADMIN_MEMBERS_DATA');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [categories, setCategories] = useState([]);
  const [donationsList, setDonationsList] = useState(() => {
    try {
      const cached = safeStorage.getSessionItem('ADMIN_DONATIONS_DATA');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [refreshTrigger]);

  const loadDashboard = async () => {
    try {
      const [dashRes, memRes, catRes, donRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getMembers(),
        api.getCategories(),
        api.getAllDonations(),
      ]);

      if (dashRes.success && dashRes.data) {
        setData((prev) => {
          const isFreshEmpty =
            dashRes.data.totalDonations === 0 &&
            dashRes.data.totalExpenses === 0 &&
            (!dashRes.data.recentActivity || dashRes.data.recentActivity.length === 0);

          const prevHasData =
            prev && (prev.totalDonations > 0 || prev.totalExpenses > 0 || (prev.recentActivity && prev.recentActivity.length > 0));

          if (isFreshEmpty && prevHasData) {
            return prev;
          }
          safeStorage.setSessionItem('ADMIN_DASH_DATA', JSON.stringify(dashRes.data));
          return dashRes.data;
        });
      }

      if (memRes.success && Array.isArray(memRes.data) && memRes.data.length > 0) {
        setMembers(memRes.data);
        safeStorage.setSessionItem('ADMIN_MEMBERS_DATA', JSON.stringify(memRes.data));
      }

      if (catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
        setCategories(catRes.data);
      }

      if (donRes.success && Array.isArray(donRes.data) && donRes.data.length > 0) {
        setDonationsList(donRes.data);
        safeStorage.setSessionItem('ADMIN_DONATIONS_DATA', JSON.stringify(donRes.data));
      }
    } catch (err) {
      console.error('Failed to load executive admin dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner text="Loading Committee Dashboard..." />;
  }

  const {
    totalDonations = 0,
    totalExpenses = 0,
    currentBalance = 0,
    categoryBreakdown = {},
    recentActivity = [],
  } = data || {};

  // 1. Separate Pure Donations Ledger
  const donationsOnlyList = useMemo(() => {
    const map = new Map();

    if (Array.isArray(donationsList)) {
      donationsList.forEach((d) => {
        const donor = d.donorName || d.name || 'Anonymous Donor';
        const key = `DON_${d.timestamp || ''}_${d.amount || 0}_${donor}`;
        map.set(key, {
          ...d,
          id: d.id || key,
          type: 'Donation',
          category: 'Donation Received',
          donorName: donor,
        });
      });
    }

    if (Array.isArray(recentActivity)) {
      recentActivity.forEach((tx) => {
        const isDonation = tx.type === 'Donation' || tx.type === 'Donations' || Boolean(tx.donorName);
        if (isDonation) {
          const donor = tx.donorName || tx.name || 'Anonymous Donor';
          const key = `DON_${tx.timestamp || ''}_${tx.amount || 0}_${donor}`;
          map.set(key, {
            ...tx,
            id: tx.id || key,
            type: 'Donation',
            category: 'Donation Received',
            donorName: donor,
          });
        }
      });
    }

    const list = Array.from(map.values());
    list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return list;
  }, [donationsList, recentActivity]);

  // 2. Separate Pure Committee Financial Expenses Ledger
  const expensesOnlyList = useMemo(() => {
    const map = new Map();

    if (Array.isArray(recentActivity)) {
      recentActivity.forEach((tx) => {
        const isDonation = tx.type === 'Donation' || tx.type === 'Donations' || Boolean(tx.donorName);
        if (!isDonation) {
          const key = `EXP_${tx.timestamp || ''}_${tx.amount || 0}_${tx.category || ''}_${tx.memberId || ''}`;
          map.set(key, {
            ...tx,
            id: tx.id || key,
            type: tx.type || 'Expenses',
            category: tx.category || 'General Expense',
          });
        }
      });
    }

    const list = Array.from(map.values());
    list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return list;
  }, [recentActivity]);

  const mergedCategoryBreakdown = {};
  if (categories && categories.length > 0) {
    categories.forEach((cat) => {
      mergedCategoryBreakdown[cat] = categoryBreakdown[cat] || 0;
    });
  }
  Object.keys(categoryBreakdown).forEach((cat) => {
    mergedCategoryBreakdown[cat] = categoryBreakdown[cat];
  });

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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Executive Dashboard
        </h1>
      </div>

      {/* Segmented Tab Bar */}
      <Navbar />

      {/* Hierarchical Financial Status Bar with Collapsible Financial Ledger Summary */}
      <div className="reference-card rounded-3xl overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white shadow-sm border border-slate-200 transition-all">
        
        {/* Main Header Bar (Clickable to toggle summary dropdown) */}
        <div
          onClick={() => {
            triggerHaptic(10);
            setIsSummaryExpanded((prev) => !prev);
          }}
          className="p-5 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
        >
          <div className="space-y-1 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                  ₹{currentBalance.toLocaleString('en-IN')}
                </span>
                <div className={`p-1 rounded-full text-slate-400 hover:text-[#0f52ba] transition-transform duration-200 ${
                  isSummaryExpanded ? 'rotate-180 text-[#0f52ba] bg-blue-50' : ''
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Mobile Refresh & Logout Buttons */}
              <div className="flex items-center gap-2 sm:hidden shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic(15);
                    triggerRefresh();
                  }}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors border border-emerald-200 active:scale-95 shadow-2xs cursor-pointer"
                  title="Sync live data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic(20);
                    logout();
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Net Committee Balance</span>
            </div>
          </div>

          {/* Desktop Refresh & Logout Buttons */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(15);
                triggerRefresh();
              }}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors border border-emerald-200 active:scale-95 shadow-2xs cursor-pointer"
              title="Sync live data"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(20);
                logout();
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2.5 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Collapsible Dropdown: Financial Ledger Summary */}
        {isSummaryExpanded && (
          <div className="p-5 px-6 border-t border-slate-100 bg-slate-50/70 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Wallet className="w-3.5 h-3.5 text-[#0f52ba]" />
                <span>Financial Ledger Summary</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Live Overview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Total Donations</span>
                <span className="text-lg font-extrabold text-emerald-700">+ ₹{totalDonations.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Total Expenses</span>
                <span className="text-lg font-extrabold text-amber-700">- ₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#edf4fc] border border-[#bfdbfe] shadow-2xs">
                <span className="text-[10px] font-extrabold text-[#1e40af] uppercase tracking-wider block">Net Balance</span>
                <span className="text-lg font-extrabold text-[#1d4ed8]">₹{currentBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Dedicated Donation Transactions Ledger */}
      <ActivityLedger
        transactions={donationsOnlyList}
        showMember={false}
        showCategory={false}
        title="Donation Transactions"
        categories={['Donation Received']}
        members={members}
      />

      {/* Section 2: Category Spending Analytics Card */}
      <div className="reference-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2 truncate">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f52ba] shrink-0" />
            <span className="truncate">Category Spending Breakdown</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium shrink-0 whitespace-nowrap">Budget Share</span>
        </div>

        <div className="space-y-3 pt-1">
          {Object.keys(mergedCategoryBreakdown).length > 0 ? (
            Object.entries(mergedCategoryBreakdown).map(([cat, amt]) => {
              const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#0f172a]">{cat}</span>
                    <span className="text-slate-600">
                      ₹{amt.toLocaleString('en-IN')} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-[#0f52ba] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No categories found.</p>
          )}
        </div>
      </div>

      {/* Section 3: Dedicated Committee Financial Expenses Ledger */}
      <ActivityLedger
        transactions={expensesOnlyList}
        showMember={true}
        title="Committee Financial Expenses"
        categories={categories}
        members={members}
      />
    </div>
  );
}
