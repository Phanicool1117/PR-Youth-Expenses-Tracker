import React from 'react';

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="centered-container py-16 flex flex-col items-center justify-center space-y-5 animate-fade-in">
      {/* Standalone Logo */}
      <img
        src="/Logo.png"
        alt="PR Youth Logo"
        className="w-24 h-24 object-contain drop-shadow-md animate-pulse"
      />

      {/* Theme-Synced Dual Ring Round Spinner */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#0f52ba]/20 border-t-[#0f52ba] animate-spin" />
        {/* Inner Ring (Counter Spin Accent) */}
        <div className="absolute inset-1.5 rounded-full border-4 border-emerald-500/20 border-b-emerald-500 animate-spin-reverse" />
      </div>

      {/* Subtle Text */}
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
        {text}
      </p>
    </div>
  );
}
