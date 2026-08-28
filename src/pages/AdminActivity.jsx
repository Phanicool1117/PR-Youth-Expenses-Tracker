import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TransactionItem } from '../components/TransactionItem';
import { History } from 'lucide-react';

export function AdminActivity() {
  const [activity, setActivity] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const [actRes, memRes] = await Promise.all([
        api.getMyActivity(''),
        api.getMembers(),
      ]);
      if (actRes.success && actRes.data) {
        setActivity(actRes.data);
      }
      if (memRes.success && memRes.data) {
        setMembers(memRes.data);
      }
    } catch (err) {
      console.error('Failed to load global activity log', err);
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
          Global Committee Expense Activity
        </h1>
        <p className="text-xs text-[#707070] mt-1">
          Real-time chronological timeline of all committee expense transactions.
        </p>
      </div>

      {/* Activity List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activity.length > 0 ? (
        <div className="space-y-3">
          {activity.map((tx, idx) => (
            <TransactionItem key={tx.id || idx} transaction={tx} showMember={true} members={members} />
          ))}
        </div>
      ) : (
        <div className="apple-card text-center py-16">
          <p className="text-sm text-[#707070]">No expense transactions recorded yet.</p>
        </div>
      )}
    </div>
  );
}
