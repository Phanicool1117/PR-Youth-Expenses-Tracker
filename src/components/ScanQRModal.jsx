import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, Sparkles, Smartphone, ShieldCheck, Sun } from 'lucide-react';
import { triggerHaptic, playSuccessSound } from '../utils/hapticsSound';

export function ScanQRModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('gpay'); // 'gpay' | 'phonepe'
  const [copied, setCopied] = useState(false);

  // Screen WakeLock & High Brightness Simulation
  useEffect(() => {
    if (!isOpen) return;
    let wakeLock = null;
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((wl) => {
        wakeLock = wl;
      }).catch(() => {});
    }
    return () => {
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
  const stampTitleTop = isGPay ? 'Gpay' : 'PhonePe';
  const stampTitleSub = 'QR';
  const underStampTitle = isGPay ? 'Gpay QR' : 'PhonePe QR';

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in select-none"
    >
      {/* High Luminance Background Radiance (80%+ Brightness Effect for camera scans) */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/15 pointer-events-none" />

      {/* Bottom Sheet Modal Container matching Reference Image */}
      <div className="bg-white rounded-t-[36px] sm:rounded-[32px] shadow-2xl border border-slate-200/90 w-full max-w-sm sm:max-w-md overflow-hidden relative animate-slide-up sm:animate-scale-up p-5 sm:p-7 space-y-4">
        
        {/* Top Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher (Gpay & Phonepe) */}
        <div className="flex items-center justify-center pt-1">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setActiveTab('gpay');
                setCopied(false);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                isGPay
                  ? 'bg-white text-[#0f52ba] shadow-sm border border-blue-100 scale-102'
                  : 'text-slate-600 hover:text-slate-900'
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
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                !isGPay
                  ? 'bg-white text-[#6739b7] shadow-sm border border-purple-100 scale-102'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>PhonePe</span>
            </button>
          </div>
        </div>

        {/* Heading matching Screenshot */}
        <div className="text-center space-y-0.5">
          <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
            {isGPay ? 'Gpay QR Code' : 'Phonepe QR Code'}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Sun className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>High Brightness & Scanner Enhanced</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AUTHENTIC POSTAGE STAMP CONTAINER (Exact Match to User Reference Image)   */}
        {/* ========================================================================= */}
        <div className="flex justify-center py-1">
          <div className="relative w-[270px] sm:w-[290px] filter drop-shadow-[0_12px_24px_rgba(147,51,234,0.18)]">
            
            {/* SVG Authentic Scalloped Stamp Background with True Perforated Teeth */}
            <svg
              viewBox="0 0 280 340"
              className="w-full h-auto drop-shadow-sm"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="stampBg" x1="0" y1="0" x2="280" y2="340" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#faf5ff" />
                  <stop offset="50%" stopColor="#f5effa" />
                  <stop offset="100%" stopColor="#f3e8f8" />
                </linearGradient>
                <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#9333ea" floodOpacity="0.08" />
                </filter>
              </defs>

              {/* Scalloped Stamp Path: Top, Right, Bottom, Left circular notches */}
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
                  A 6 6 0 0 0 274 314
                  A 6 6 0 0 0 274 326
                  L 274 334
                  L 266 334
                  A 6 6 0 0 0 254 334
                  A 6 6 0 0 0 242 334
                  A 6 6 0 0 0 230 334
                  A 6 6 0 0 0 218 334
                  A 6 6 0 0 0 206 334
                  A 6 6 0 0 0 194 334
                  A 6 6 0 0 0 182 334
                  A 6 6 0 0 0 170 334
                  A 6 6 0 0 0 158 334
                  A 6 6 0 0 0 146 334
                  A 6 6 0 0 0 134 334
                  A 6 6 0 0 0 122 334
                  A 6 6 0 0 0 110 334
                  A 6 6 0 0 0 98 334
                  A 6 6 0 0 0 86 334
                  A 6 6 0 0 0 74 334
                  A 6 6 0 0 0 62 334
                  A 6 6 0 0 0 50 334
                  A 6 6 0 0 0 38 334
                  A 6 6 0 0 0 26 334
                  A 6 6 0 0 0 14 334
                  L 6 334
                  L 6 326
                  A 6 6 0 0 0 6 314
                  A 6 6 0 0 0 6 302
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
                fill="url(#stampBg)"
                stroke="#e9d5ff"
                strokeWidth="1.5"
                filter="url(#softGlow)"
              />
            </svg>

            {/* Stamp Inner Content Overlay */}
            <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between">
              
              {/* Header inside Stamp */}
              <div className="flex items-start justify-between pl-1 pr-1 pt-1">
                {/* Top-Left Stamp Title matching "The / OG King" */}
                <div className="text-left font-black text-slate-900 leading-[1.15]">
                  <p className="text-xs sm:text-[13px] tracking-tight">{stampTitleTop}</p>
                  <p className="text-xs sm:text-[13px] text-purple-700 tracking-tight font-black">{stampTitleSub}</p>
                </div>

                {/* Top-Right Vintage Postal Cancellation Watermark Waves (No text numbers) */}
                <div className="opacity-40 select-none pointer-events-none transform rotate-[-8deg] -mr-1">
                  <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6 Q 8 2, 14 6 T 26 6 T 38 6 T 46 6" stroke="#9333ea" strokeWidth="1.2" fill="none" strokeDasharray="2,2"/>
                    <path d="M2 12 Q 8 8, 14 12 T 26 12 T 38 12 T 46 12" stroke="#9333ea" strokeWidth="1.2" fill="none"/>
                    <path d="M2 18 Q 8 14, 14 18 T 26 18 T 38 18 T 46 18" stroke="#9333ea" strokeWidth="1.2" fill="none" strokeDasharray="3,1"/>
                  </svg>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* CENTER QR CODE WITH LIVE GLOWING SCAN RAY BEAM                            */}
              {/* ========================================================================= */}
              <div className="relative flex items-center justify-center my-auto py-1">
                
                {/* High Contrast White QR Container with 80%+ Luminance */}
                <div className="relative bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-purple-950/15 border border-purple-200 overflow-hidden group">
                  
                  {/* High Resolution Sharp QR Image */}
                  <img
                    src={qrImage}
                    alt={`${isGPay ? 'GPay' : 'PhonePe'} QR Code`}
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl select-none filter contrast-[1.08] brightness-[1.05]"
                    draggable={false}
                  />

                  {/* Active Neon Scanning Ray / Laser Beam sweeping vertically */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_3px_rgba(56,189,248,0.9)] animate-scan-ray pointer-events-none z-10" />
                  <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-cyan-400/25 via-cyan-400/10 to-transparent pointer-events-none animate-scan-ray z-10" />
                </div>

              </div>

              {/* Bottom Tagline inside Stamp */}
              <div className="text-center pb-1">
                <p className="text-[8.5px] font-bold text-purple-900/70 tracking-wide uppercase">
                  Penumuli Perantalamma Youth Fund
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNDER THE STAMP: TITLE & UPI ID (Matching "The OG King" Hierarchy)        */}
        {/* ========================================================================= */}
        <div className="space-y-2 text-center pt-1">
          
          {/* Title under Stamp matching Reference Image */}
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            {underStampTitle}
          </h3>

          {/* UPI ID Pill with One-Tap Copy */}
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
