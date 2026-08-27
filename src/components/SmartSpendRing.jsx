import React, { useState } from 'react';
import { Lightbulb, ChevronRight, TrendingDown, Target } from 'lucide-react';

export function SmartSpendRing({ totalSpent = 0, budgetTarget = 50000 }) {
  const [expanded, setExpanded] = useState(false);

  const pct = Math.min(100, Math.round((totalSpent / budgetTarget) * 100));
  const remaining = Math.max(0, budgetTarget - totalSpent);

  // SVG Ring calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  // Gradient color based on spend percentage
  let ringGradient = 'from-emerald-500 to-teal-400';
  let statusText = 'Budget on track';
  let statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (pct > 75) {
    ringGradient = 'from-rose-500 to-amber-500';
    statusText = 'Approaching budget limit';
    statusBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (pct > 50) {
    ringGradient = 'from-amber-500 to-yellow-400';
    statusText = 'Moderate spending';
    statusBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="apple-card p-5 space-y-4 bg-gradient-to-br from-white via-[#f4f8fb]/50 to-white">
      <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-3">
        <div>
          <h3 className="font-bold text-sm text-[#1d1d1f] flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#0071e3]" />
            Interactive Smart Spend Ring
          </h3>
          <p className="text-[11px] text-[#858585]">Real-time budget vs. expenditure</p>
        </div>

        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBg}`}>
          {statusText}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* Apple Activity Circular Progress Ring */}
        <div
          onClick={() => setExpanded(!expanded)}
          className="relative w-36 h-36 flex items-center justify-center cursor-pointer group shrink-0"
          title="Click to toggle detailed breakdown"
        >
          <svg viewBox="0 0 130 130" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="#e5e5ea"
              strokeWidth="12"
            />
            {/* Animated Gradient Progress Ring */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="url(#ringGradient)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0071e3" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-[#1d1d1f] tracking-tight">{pct}%</span>
            <span className="text-[10px] font-semibold text-[#858585] uppercase tracking-wider">Used</span>
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-3 w-full">
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea]">
              <span className="text-[10px] font-semibold text-[#858585] uppercase tracking-wider block">Total Spent</span>
              <span className="text-lg font-bold text-[#1d1d1f]">₹{totalSpent.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">Budget Remaining</span>
              <span className="text-lg font-bold text-emerald-700">₹{remaining.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Smart AI Suggestion Tip */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Smart Tip: </span>
              {pct < 50 ? (
                <span>Great job! You are under 50% of the festival budget limit.</span>
              ) : (
                <span>You've used {pct}% of your budget allocation. Monitor decorations and travel spending!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
