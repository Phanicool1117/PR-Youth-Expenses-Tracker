import React from 'react';
import { Trophy, Award } from 'lucide-react';

export function LeaderboardCard({ members = [] }) {
  // Sort members by total expenses descending
  const sortedMembers = [...members].sort((a, b) => (b.totalExpenses || 0) - (a.totalExpenses || 0));

  const first = sortedMembers[0];
  const second = sortedMembers[1];
  const third = sortedMembers[2];

  return (
    <div className="apple-card p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-3">
        <h3 className="font-semibold text-base text-[#1d1d1f] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Member Expense Leaderboard
        </h3>
        <span className="text-xs text-[#858585] font-medium">Top Out-of-Pocket Spenders</span>
      </div>

      {/* Top 3 Member Podium */}
      <div className="grid grid-cols-3 gap-2 items-end justify-center pt-4 pb-2 text-center">
        {/* 2nd Place */}
        {second ? (
          <div className="flex flex-col items-center p-3 rounded-2xl bg-[#f4f8fb] border border-[#d2d2d7]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center font-bold text-slate-700 text-sm shadow-xs">
                {second.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-slate-400 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                2
              </span>
            </div>
            <div className="mt-2 font-semibold text-xs text-[#1d1d1f] truncate w-full">{second.name}</div>
            <div className="text-xs font-bold text-amber-700">₹{(second.totalExpenses || 0).toLocaleString('en-IN')}</div>
          </div>
        ) : (
          <div className="opacity-0" />
        )}

        {/* 1st Place */}
        {first ? (
          <div className="flex flex-col items-center p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm transform -translate-y-2">
            <div className="relative">
              <Award className="w-5 h-5 text-amber-500 absolute -top-3 left-3" />
              <div className="w-14 h-14 rounded-full bg-amber-400 border-2 border-amber-600 flex items-center justify-center font-bold text-amber-950 text-base shadow-sm">
                {first.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                1
              </span>
            </div>
            <div className="mt-2 font-bold text-sm text-amber-950 truncate w-full">{first.name}</div>
            <div className="text-sm font-extrabold text-amber-700">₹{(first.totalExpenses || 0).toLocaleString('en-IN')}</div>
          </div>
        ) : (
          <div className="opacity-0" />
        )}

        {/* 3rd Place */}
        {third ? (
          <div className="flex flex-col items-center p-3 rounded-2xl bg-[#fff7ed] border border-[#ffedd5]">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-amber-200 border-2 border-amber-700 flex items-center justify-center font-bold text-amber-900 text-sm shadow-xs">
                {third.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                3
              </span>
            </div>
            <div className="mt-2 font-semibold text-xs text-[#1d1d1f] truncate w-full">{third.name}</div>
            <div className="text-xs font-bold text-amber-800">₹{(third.totalExpenses || 0).toLocaleString('en-IN')}</div>
          </div>
        ) : (
          <div className="opacity-0" />
        )}
      </div>

      {/* Full Rankings List */}
      <div className="space-y-2 pt-2 border-t border-[#e5e5ea]">
        {sortedMembers.map((m, idx) => (
          <div
            key={m.memberId}
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5f5f7] text-xs hover:bg-[#e2e2e5] transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#858585] w-4 text-center">#{idx + 1}</span>
              <div>
                <span className="font-semibold text-[#1d1d1f]">{m.name}</span>
                <span className="text-[10px] text-[#858585] font-mono ml-2">({m.memberId})</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-[#1d1d1f]">₹{(m.totalExpenses || 0).toLocaleString('en-IN')}</span>
              <div className="text-[10px] text-[#707070]">{m.expenseCount || 0} Expenses</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
