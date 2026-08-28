import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { triggerHaptic } from '../utils/hapticsSound';
import { ActivityLedger } from '../components/ActivityLedger';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Navbar } from '../components/Navbar';
import { Layers, RefreshCw, Wallet, LogOut } from 'lucide-react';

export function AdminDashboard() {
  const { logout, refreshTrigger, triggerRefresh, isSyncing } = useAuth();
  
  const [data, setData] = useState(() => {
    const cached = sessionStorage.getItem('ADMIN_DASH_DATA');
    return cached ? JSON.parse(cached) : {
      totalDonations: 0,
      totalExpenses: 0,
      currentBalance: 0,
      expenseCount: 0,
      categoryBreakdown: {},
      recentActivity: [],
    };
  });
  const [members, setMembers] = useState(() => {
    const cached = sessionStorage.getItem('ADMIN_MEMBERS_DATA');
    return cached ? JSON.parse(cached) : [];
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [refreshTrigger]);

  const loadDashboard = async () => {
    try {
      const [dashRes, memRes, catRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getMembers(),
        api.getCategories(),
      ]);

      if (dashRes.success && dashRes.data) {
        setData(dashRes.data);
        sessionStorage.setItem('ADMIN_DASH_DATA', JSON.stringify(dashRes.data));
      }
      if (memRes.success && memRes.data) {
        setMembers(memRes.data);
        sessionStorage.setItem('ADMIN_MEMBERS_DATA', JSON.stringify(memRes.data));
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
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
    expenseCount = 0,
    categoryBreakdown = {},
    recentActivity = [],
  } = data || {};

  // Combined audit ledger activity array combining ALL donations and expenses with guaranteed stability
  const combinedAuditLedger = useMemo(() => {
    const list = Array.isArray(recentActivity) ? [...recentActivity] : [];
    
    // Normalize and stabilize transaction list
    const normalized = list.map((tx, idx) => {
      const isDonation = tx.type === 'Donation' || tx.type === 'Donations' || Boolean(tx.donorName);
      return {
        ...tx,
        id: tx.id || `TX_${tx.timestamp || Date.now()}_${idx}`,
        type: isDonation ? 'Donation' : (tx.type || 'Expenses'),
        donorName: isDonation ? (tx.donorName || tx.name || 'Anonymous') : undefined,
        category: isDonation ? 'Donation Received' : (tx.category || 'General Expense'),
      };
    });

    normalized.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return normalized;
  }, [recentActivity]);

  // Build complete dynamic category breakdown combining active Google Sheet categories + logged expenses
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

      {/* Hierarchical Financial Status Bar */}
      <div className="reference-card rounded-3xl p-5 px-6 bg-gradient-to-br from-white via-slate-50/50 to-white shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              ₹{currentBalance.toLocaleString('en-IN')}
            </div>

            {/* Mobile Refresh & Logout Buttons */}
            <div className="flex items-center gap-2 sm:hidden shrink-0">
              <button
                onClick={() => {
                  triggerHaptic(15);
                  triggerRefresh();
                }}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors border border-emerald-200 active:scale-95 shadow-2xs cursor-pointer"
                title="Sync live data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
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

          <div className="text-[11px] font-medium text-slate-500 pt-0.5">
            {expenseCount} Receipts Logged · {members.length} Members Active
          </div>
        </div>

        {/* Desktop Refresh & Logout Buttons */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              triggerHaptic(15);
              triggerRefresh();
            }}
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors border border-emerald-200 active:scale-95 shadow-2xs cursor-pointer"
            title="Sync live data"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
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

      {/* Financial Summary Card */}
      <div className="reference-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2 truncate">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f52ba] shrink-0" />
            <span className="truncate">Financial Ledger Summary</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium shrink-0 whitespace-nowrap">Live Overview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Total Donations</span>
            <span className="text-xl font-extrabold text-emerald-700">₹{totalDonations.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Total Expenses</span>
            <span className="text-xl font-extrabold text-amber-700">₹{totalExpenses.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#edf4fc] border border-[#bfdbfe]">
            <span className="text-[10px] font-extrabold text-[#1e40af] uppercase tracking-wider block">Net Balance</span>
            <span className="text-xl font-extrabold text-[#1d4ed8]">₹{currentBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Category Spending Analytics Card */}
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

      {/* Single Unified Committee Financial Audit Activity Ledger */}
      <ActivityLedger
        transactions={combinedAuditLedger}
        showMember={true}
        title="Committee Financial Audit Activity"
        categories={categories}
        members={members}
      />
    </div>
  );
}
