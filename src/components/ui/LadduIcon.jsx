import React from 'react';

// Custom Lucide-styled Auspicious Golden Laddu Icon SVG
export function LadduIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8.5" fill="#f59e0b" fillOpacity="0.25" stroke="#d97706" />
      <circle cx="9.5" cy="9.5" r="1.1" fill="#d97706" />
      <circle cx="14.5" cy="10" r="1.1" fill="#d97706" />
      <circle cx="11.5" cy="14" r="1.1" fill="#d97706" />
      <circle cx="15" cy="14" r="0.9" fill="#d97706" />
      <circle cx="8.5" cy="13.5" r="0.9" fill="#d97706" />
    </svg>
  );
}
