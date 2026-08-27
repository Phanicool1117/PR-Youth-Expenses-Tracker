import React from 'react';

export function DonutChart({ cash = 0, upi = 0, other = 0, total = 0 }) {
  const safeTotal = total > 0 ? total : 1;

  const cashPct = Math.round((cash / safeTotal) * 100);
  const upiPct = Math.round((upi / safeTotal) * 100);
  const otherPct = Math.max(0, 100 - cashPct - upiPct);

  // SVG Ring Calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.32

  const upiDash = (upiPct / 100) * circumference;
  const cashDash = (cashPct / 100) * circumference;
  const otherDash = (otherPct / 100) * circumference;

  const upiOffset = 0;
  const cashOffset = -upiDash;
  const otherOffset = -(upiDash + cashDash);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* SVG Donut */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#f5f5f7"
            strokeWidth="12"
          />

          {/* UPI Segment (Apple Blue) */}
          {upiPct > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#0071e3"
              strokeWidth="12"
              strokeDasharray={`${upiDash} ${circumference}`}
              strokeDashoffset={upiOffset}
              className="transition-all duration-500"
            />
          )}

          {/* Cash Segment (Emerald Green) */}
          {cashPct > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="12"
              strokeDasharray={`${cashDash} ${circumference}`}
              strokeDashoffset={cashOffset}
              className="transition-all duration-500"
            />
          )}

          {/* Other Segment (Amber) */}
          {otherPct > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeDasharray={`${otherDash} ${circumference}`}
              strokeDashoffset={otherOffset}
              className="transition-all duration-500"
            />
          )}
        </svg>

        {/* Center Total Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-[#1d1d1f]">₹{total.toLocaleString('en-IN')}</span>
          <span className="text-[10px] font-semibold text-[#858585] uppercase tracking-wider">Total Collection</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#0071e3]" />
          <span className="text-[#1d1d1f]">UPI ({upiPct}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-[#1d1d1f]">Cash ({cashPct}%)</span>
        </div>
        {otherPct > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[#1d1d1f]">Other ({otherPct}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
