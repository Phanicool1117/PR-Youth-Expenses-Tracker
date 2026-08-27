import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { triggerHaptic } from '../utils/hapticsSound';
import { ActivityLedger } from '../components/ActivityLedger';
import { Navbar } from '../components/Navbar';
import { RefreshCw, LogOut } from 'lucide-react';

export function MemberDashboard() {
  const { user, logout, refreshTrigger, triggerRefresh, isSyncing } = useAuth();
  const [data, setData] = useState(() => {
    const cached = sessionStorage.getItem(`MEMBER_DASH_${user?.memberId}`);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!data);
  const [categories, setCategories] = useState([]);

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

  return (
    <div className="centered-container py-6 sm:py-10 space-y-6">
      {/* 1. Standalone Logo on Top */}
      <div className="flex items-center justify-center pt-2">
        <img
          src="/Logo.png"
          alt="PR Youth Logo"
          className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-md hover:scale-105 transition-transform"
        />
      </div>

      {/* 2. Greeting Section */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Hi, {user.name}
        </h1>
      </div>

      {/* 3. Symmetrical 50/50 Segmented Tab Bar (Home | Add) */}
      <Navbar />

      {/* 4. Hierarchical Financial Status Bar */}
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

      {/* 5. Clean & Simple Activity Ledger (Removed duplicate form card!) */}
      <ActivityLedger
        transactions={recentActivity}
        showMember={false}
        title="My Activity History"
        categories={categories}
      />
    </div>
  );
}
