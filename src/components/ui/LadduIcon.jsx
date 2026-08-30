import React from 'react';

// Clean Minimal Circle Icon with Light Orange Fill
export function LadduIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="#ffedd5"
        stroke="#f97316"
        strokeWidth="2.2"
      />
    </svg>
  );
}
