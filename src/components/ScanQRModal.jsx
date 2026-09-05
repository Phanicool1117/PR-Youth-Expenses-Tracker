import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { triggerHaptic, playSuccessSound } from '../utils/hapticsSound';

export function ScanQRModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('gpay'); // 'gpay' | 'phonepe'
  const [copied, setCopied] = useState(false);

  // Automatic Screen Brightness & WakeLock Lifecycle
  useEffect(() => {
    if (!isOpen) return;

    // Automatically boost screen brightness & contrast for effortless camera scanning
    const previousFilter = document.documentElement.style.filter;
    document.documentElement.style.filter = 'brightness(1.18) contrast(1.05)';

    let wakeLock = null;
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((wl) => {
        wakeLock = wl;
      }).catch(() => {});
    }

    // Automatically restore normal screen brightness when modal is closed
    return () => {
      document.documentElement.style.filter = previousFilter || '';
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle hardware / gesture back button
  useEffect(() => {
    if (!isOpen) return;
    try {
      window.history.pushState({ modalOpen: 'scanQR' }, '');
    } catch (e) {}

    const handlePopState = () => {
      if (onClose) onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isGPay = activeTab === 'gpay';
  const upiId = isGPay ? '9849590408-1@okbizaxis' : 'Q178007075@ybl';
  const payeeName = isGPay ? 'Bhimavarapu Phaneendra Reddy' : 'PhonePe Merchant (PR Youth)';
  const qrImage = isGPay ? '/Gpay-QR.jpeg' : '/Phonepe-QR.jpeg';
  const headerTitle = isGPay ? 'GPay QR Code' : 'PhonePe QR Code';

  // Theme configuration: Soft Orange glow for GPay, Soft Green glow for PhonePe (Zero outlines)
  const theme = isGPay
    ? {
        name: 'gpay',
        tabActiveClass: 'bg-white text-orange-600 shadow-sm border-0 font-black',
        tabInactiveClass: 'text-slate-600 hover:text-slate-900 border-0 font-bold',
        dropShadowClass: 'drop-shadow-[0_16px_36px_rgba(249,115,22,0.32)]',
        bgStart: '#fff7ed',
        bgMid: '#fffaf5',
        bgEnd: '#ffedd5',
        floodColor: '#f97316',
      }
    : {
        name: 'phonepe',
        tabActiveClass: 'bg-white text-emerald-700 shadow-sm border-0 font-black',
        tabInactiveClass: 'text-slate-600 hover:text-slate-900 border-0 font-bold',
        dropShadowClass: 'drop-shadow-[0_16px_36px_rgba(34,197,94,0.32)]',
        bgStart: '#f0fdf4',
        bgMid: '#f7fee7',
        bgEnd: '#dcfce7',
        floodColor: '#22c55e',
      };

  const handleCopyUpi = () => {
    triggerHaptic(15);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      playSuccessSound();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleClose = () => {
    triggerHaptic(10);
    if (window.history.state?.modalOpen === 'scanQR') {
      window.history.back();
    }
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in select-none"
    >
      {/* High Luminance Background Radiance */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/15 pointer-events-none" />

      {/* Bottom Sheet Modal Container with Pure Vertical Slide-Up */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-t-[36px] sm:rounded-[32px] shadow-2xl border border-slate-200/90 overflow-hidden relative animate-bottom-sheet p-5 sm:p-7 space-y-4">
        
        {/* Top Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher (GPay & PhonePe) - Zero Border Lines */}
        <div className="flex items-center justify-center pt-1">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 shadow-inner border-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('gpay');
                setCopied(false);
              }}
              className={`px-5 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                isGPay ? theme.tabActiveClass : 'text-slate-600 hover:text-slate-900 border-0 font-bold'
              }`}
            >
              <span>GPay</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('phonepe');
                setCopied(false);
              }}
              className={`px-5 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                !isGPay ? theme.tabActiveClass : 'text-slate-600 hover:text-slate-900 border-0 font-bold'
              }`}
            >
              <span>PhonePe</span>
            </button>
          </div>
        </div>

        {/* Heading at Top: "GPay QR Code" or "PhonePe QR Code" */}
        <div className="text-center pt-1 pb-0.5">
          <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
            {headerTitle}
          </h2>
        </div>

        {/* ========================================================================= */}
        {/* PURE POSTAGE STAMP CONTAINER (Only Ambient Glow - No Outline)             */}
        {/* ========================================================================= */}
        <div className="flex justify-center py-2">
          <div className={`relative w-[270px] sm:w-[290px] filter ${theme.dropShadowClass} transition-all duration-300`}>
            
            {/* SVG Authentic Scalloped Stamp Background with Ambient Glow (stroke="none") */}
            <svg
              viewBox="0 0 280 310"
              className="w-full h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`stampBg-${theme.name}`} x1="0" y1="0" x2="280" y2="310" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={theme.bgStart} />
                  <stop offset="50%" stopColor={theme.bgMid} />
                  <stop offset="100%" stopColor={theme.bgEnd} />
                </linearGradient>
                <filter id={`softGlow-${theme.name}`} x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={theme.floodColor} floodOpacity="0.22" />
                </filter>
              </defs>

              {/* Scalloped Stamp Path without Colored Border Lines */}
              <path
                d="
                  M 14 6
                  A 6 6 0 0 0 26 6
                  A 6 6 0 0 0 38 6
                  A 6 6 0 0 0 50 6
                  A 6 6 0 0 0 62 6
                  A 6 6 0 0 0 74 6
                  A 6 6 0 0 0 86 6
                  A 6 6 0 0 0 98 6
                  A 6 6 0 0 0 110 6
                  A 6 6 0 0 0 122 6
                  A 6 6 0 0 0 134 6
                  A 6 6 0 0 0 146 6
                  A 6 6 0 0 0 158 6
                  A 6 6 0 0 0 170 6
                  A 6 6 0 0 0 182 6
                  A 6 6 0 0 0 194 6
                  A 6 6 0 0 0 206 6
                  A 6 6 0 0 0 218 6
                  A 6 6 0 0 0 230 6
                  A 6 6 0 0 0 242 6
                  A 6 6 0 0 0 254 6
                  A 6 6 0 0 0 266 6
                  L 274 6
                  L 274 14
                  A 6 6 0 0 0 274 26
                  A 6 6 0 0 0 274 38
                  A 6 6 0 0 0 274 50
                  A 6 6 0 0 0 274 62
                  A 6 6 0 0 0 274 74
                  A 6 6 0 0 0 274 86
                  A 6 6 0 0 0 274 98
                  A 6 6 0 0 0 274 110
                  A 6 6 0 0 0 274 122
                  A 6 6 0 0 0 274 134
                  A 6 6 0 0 0 274 146
                  A 6 6 0 0 0 274 158
                  A 6 6 0 0 0 274 170
                  A 6 6 0 0 0 274 182
                  A 6 6 0 0 0 274 194
                  A 6 6 0 0 0 274 206
                  A 6 6 0 0 0 274 218
                  A 6 6 0 0 0 274 230
                  A 6 6 0 0 0 274 242
                  A 6 6 0 0 0 274 254
                  A 6 6 0 0 0 274 266
                  A 6 6 0 0 0 274 278
                  A 6 6 0 0 0 274 290
                  A 6 6 0 0 0 274 302
                  L 274 304
                  L 266 304
                  A 6 6 0 0 0 254 304
                  A 6 6 0 0 0 242 304
                  A 6 6 0 0 0 230 304
                  A 6 6 0 0 0 218 304
                  A 6 6 0 0 0 206 304
                  A 6 6 0 0 0 194 304
                  A 6 6 0 0 0 182 304
                  A 6 6 0 0 0 170 304
                  A 6 6 0 0 0 158 304
                  A 6 6 0 0 0 146 304
                  A 6 6 0 0 0 134 304
                  A 6 6 0 0 0 122 304
                  A 6 6 0 0 0 110 304
                  A 6 6 0 0 0 98 304
                  A 6 6 0 0 0 86 304
                  A 6 6 0 0 0 74 304
                  A 6 6 0 0 0 62 304
                  A 6 6 0 0 0 50 304
                  A 6 6 0 0 0 38 304
                  A 6 6 0 0 0 26 304
                  A 6 6 0 0 0 14 304
                  L 6 304
                  L 6 302
                  A 6 6 0 0 0 6 290
                  A 6 6 0 0 0 6 278
                  A 6 6 0 0 0 6 266
                  A 6 6 0 0 0 6 254
                  A 6 6 0 0 0 6 242
                  A 6 6 0 0 0 6 230
                  A 6 6 0 0 0 6 218
                  A 6 6 0 0 0 6 206
                  A 6 6 0 0 0 6 194
                  A 6 6 0 0 0 6 182
                  A 6 6 0 0 0 6 170
                  A 6 6 0 0 0 6 158
                  A 6 6 0 0 0 6 146
                  A 6 6 0 0 0 6 134
                  A 6 6 0 0 0 6 122
                  A 6 6 0 0 0 6 110
                  A 6 6 0 0 0 6 98
                  A 6 6 0 0 0 6 86
                  A 6 6 0 0 0 6 74
                  A 6 6 0 0 0 6 62
                  A 6 6 0 0 0 6 50
                  A 6 6 0 0 0 6 38
                  A 6 6 0 0 0 6 26
                  A 6 6 0 0 0 6 14
                  L 6 6
                  Z
                "
                fill={`url(#stampBg-${theme.name})`}
                stroke="none"
                filter={`url(#softGlow-${theme.name})`}
              />
            </svg>

            {/* Stamp Center: ONLY the pure QR Code inside (No border) */}
            <div className="absolute inset-0 p-5 flex items-center justify-center">
              <div className="relative bg-white p-3.5 rounded-2xl shadow-md border-0">
                <img
                  src={qrImage}
                  alt={`${isGPay ? 'GPay' : 'PhonePe'} QR Code`}
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl select-none filter contrast-[1.08] brightness-[1.05]"
                  draggable={false}
                />
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* UPI ID & ONE-TAP COPY (Directly Under the Stamp)                           */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 text-center pt-1">
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs group"
              title="Click to copy UPI ID"
            >
              <span className="text-slate-500 font-semibold text-[11px]">UPI:</span>
              <span className="font-mono text-xs font-extrabold text-slate-900 tracking-tight">
                {upiId}
              </span>
              {copied ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <Check className="w-3 h-3" /> Copied!
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
              )}
            </button>
          </div>

          <p className="text-[10px] font-semibold text-slate-400">
            Payee: <span className="text-slate-600 font-bold">{payeeName}</span>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BUTTON: "Click to back" (Solid Black Pill Button)           */}
        {/* ========================================================================= */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-4 px-6 rounded-full bg-[#18181b] hover:bg-black text-white font-black text-sm shadow-xl shadow-slate-900/20 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Click to back</span>
          </button>
        </div>

      </div>
    </div>
  );
}
