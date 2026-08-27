import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ActivityLedger } from '../components/ActivityLedger';
import { Navbar } from '../components/Navbar';
import { CreditCard } from 'lucide-react';

export function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, catRes, memRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getCategories(),
        api.getMembers(),
      ]);

      if (dashRes.success && dashRes.data && dashRes.data.recentActivity) {
        setExpenses(dashRes.data.recentActivity);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (memRes.success && memRes.data) {
        setMembers(memRes.data);
      }
    } catch (err) {
      console.error('Failed to load expenses list', err);
    } finally {
      setLoading(false);
    }
  };

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

      {/* 2. Header */}
      <div className="text-center space-y-1 border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight flex items-center justify-center gap-2">
          <CreditCard className="w-6 h-6 text-amber-600" />
          Committee Expense Audit Log
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Comprehensive real-time receipt ledger across all members.
        </p>
      </div>

      {/* 3. Segmented Navigation Tab Bar */}
      <Navbar />

      {/* 4. Paginated & Filtered Expenses Feed (10 items per page) */}
      {loading ? (
        <div className="reference-card p-6 space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <ActivityLedger
          transactions={expenses}
          showMember={true}
          title="Full Committee Expenses Ledger"
          subtitle="Search & filter by category or member in 10-item pages"
          categories={categories}
          members={members}
        />
      )}
    </div>
  );
}
