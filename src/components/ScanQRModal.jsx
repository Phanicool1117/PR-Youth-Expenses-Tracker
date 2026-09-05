import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sun } from 'lucide-react';
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

      {/* Bottom Sheet Modal Container */}
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

        {/* Heading */}
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
        {/* CENTER QR CODE DISPLAY (With High-Contrast Frame & Animated Scan Ray)    */}
        {/* ========================================================================= */}
        <div className="flex justify-center py-2">
          <div className="relative bg-white p-3.5 sm:p-4 rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden group">
            
            {/* High Resolution Sharp QR Image */}
            <img
              src={qrImage}
              alt={`${isGPay ? 'GPay' : 'PhonePe'} QR Code`}
              className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-2xl select-none filter contrast-[1.08] brightness-[1.05]"
              draggable={false}
            />

            {/* Active Neon Scanning Ray / Laser Beam sweeping vertically */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_3px_rgba(56,189,248,0.9)] animate-scan-ray pointer-events-none z-10" />
            <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-cyan-400/25 via-cyan-400/10 to-transparent pointer-events-none animate-scan-ray z-10" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNDER THE QR: TITLE & UPI ID                                              */}
        {/* ========================================================================= */}
        <div className="space-y-2 text-center pt-1">
          
          {/* Title under QR */}
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
