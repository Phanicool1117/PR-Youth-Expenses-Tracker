import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TransactionItem } from '../components/TransactionItem';
import { History } from 'lucide-react';

export function MemberActivity() {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, [user]);

  const loadActivity = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getMyActivity(user.memberId);
      if (res.success && res.data) {
        setActivity(res.data);
      }
    } catch (err) {
      console.error('Failed to load member activity', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#e5e5ea] pb-4">
        <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-amber-600" />
          Your Expense Activity Log
        </h1>
        <p className="text-xs text-[#707070] mt-1">
          Complete chronological timeline of all committee expenses recorded by you ({user.memberId}).
        </p>
      </div>

      {/* Activity Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activity.length > 0 ? (
        <div className="space-y-3">
          {activity.map((tx, idx) => (
            <TransactionItem key={tx.id || idx} transaction={tx} />
          ))}
        </div>
      ) : (
        <div className="apple-card text-center py-16 space-y-2">
          <p className="text-sm font-medium text-[#707070]">No expense entries added yet.</p>
        </div>
      )}
    </div>
  );
}
