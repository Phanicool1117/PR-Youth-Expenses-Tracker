import React from 'react';

export function MetricCard({ title, value, subtext, icon: Icon, highlightColor = 'blue' }) {
  const colorMap = {
    blue: 'text-[#0071e3] bg-[#0071e3]/10',
    green: 'text-emerald-600 bg-emerald-500/10',
    amber: 'text-amber-600 bg-amber-500/10',
    purple: 'text-purple-600 bg-purple-500/10',
  };

  return (
    <div className="apple-card flex flex-col justify-between p-5 hover:border-[#c6c6c8] transition-all">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#858585] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-full ${colorMap[highlightColor] || colorMap.blue}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">{value}</div>
        {subtext && <div className="mt-1 text-xs text-[#707070]">{subtext}</div>}
      </div>
    </div>
  );
}
