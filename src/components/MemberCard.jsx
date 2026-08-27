import React from 'react';
import { CreditCard, Calendar } from 'lucide-react';

export function MemberCard({ member }) {
  const formatDate = (isoStr) => {
    if (!isoStr) return 'No activity yet';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="apple-card p-5 space-y-4 hover:border-amber-500/40 transition-all">
      {/* Member Header */}
      <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700 font-semibold text-sm">
            {member.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-base text-[#1d1d1f] flex items-center gap-2">
              <span>{member.name}</span>
              <span className="text-[11px] font-mono text-[#858585] bg-[#f5f5f7] px-2 py-0.5 rounded border border-[#e5e5ea]">
                {member.memberId}
              </span>
            </div>
            <div className="text-xs text-[#707070] flex items-center gap-1 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${member.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{member.active ? 'Active Account' : 'Deactivated'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Summary Details */}
      <div className="p-4 rounded-xl bg-[#fff7ed] border border-[#ffedd5] space-y-1">
        <div className="text-amber-800 font-semibold text-xs flex items-center gap-1">
          <CreditCard className="w-4 h-4 text-amber-600" />
          <span>Total Expenses Paid ({member.expenseCount || 0} entries)</span>
        </div>
        <div className="text-2xl font-extrabold text-[#1d1d1f]">
          ₹{(member.totalExpenses || 0).toLocaleString('en-IN')}
        </div>
        <div className="text-[11px] text-[#707070]">Total out-of-pocket committee expenses</div>
      </div>

      {/* Last Activity Footer */}
      <div className="flex items-center gap-1.5 text-xs text-[#858585] pt-1">
        <Calendar className="w-3.5 h-3.5 text-[#0071e3]" />
        <span>Last Expense Date:</span>
        <span className="font-medium text-[#474747]">{formatDate(member.lastActivity)}</span>
      </div>
    </div>
  );
}
