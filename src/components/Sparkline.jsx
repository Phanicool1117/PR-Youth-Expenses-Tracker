import React from 'react';

export function Sparkline({ color = '#0071e3', positive = true }) {
  const path = positive
    ? 'M0 25 Q15 20, 30 22 T60 12 T90 15 T120 4'
    : 'M0 5 Q15 10, 30 8 T60 18 T90 16 T120 26';

  const strokeColor = positive ? '#10b981' : '#f59e0b';
  const fillColor = positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)';

  return (
    <div className="w-24 h-10 shrink-0">
      <svg viewBox="0 0 120 30" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L120 30 L0 30 Z`}
          fill={`url(#grad-${positive})`}
        />
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
