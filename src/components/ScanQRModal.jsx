import React, { useState, useEffect } from 'react';
import { X, Copy, Check, QrCode, Sparkles, Smartphone, ShieldCheck, ArrowLeft } from 'lucide-react';
import { triggerHaptic } from '../utils/hapticsSound';

export function ScanQRModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('gpay'); // 'gpay' | 'phonepe'
  const [copied, setCopied] = useState(false);

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
  const stampNumber = isGPay ? '01' : '02';
  const title = isGPay ? 'Gpay QR Code' : 'Phonepe QR Code';

  const handleCopyUpi = () => {
    triggerHaptic(15);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto animate-fade-in select-none"
    >
      {/* Bottom Sheet Modal Container matching Reference Image */}
      <div className="bg-white rounded-t-[36px] sm:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-sm sm:max-w-md overflow-hidden relative animate-slide-up sm:animate-scale-up p-5 sm:p-7 space-y-4">
        
        {/* Top Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
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

        {/* Heading & Subtitle */}
        <div className="text-center space-y-0.5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-[11px] font-semibold text-slate-500">
            Penumuli Perantalamma Youth Festival Fund
          </p>
        </div>

        {/* ========================================================================= */}
        {/* POSTAGE STAMP CARD LAYOUT (Exact Match to User Reference Image)            */}
        {/* ========================================================================= */}
        <div className="flex justify-center py-2">
          
          {/* Outer Stamp with Perforated Scalloped Zigzag Edges */}
          <div className="relative p-2.5 sm:p-3 bg-gradient-to-b from-[#faf5ff] to-[#f3e8ff] border-2 border-[#e9d5ff] rounded-2xl shadow-xl shadow-purple-900/10 max-w-[260px] sm:max-w-[280px] w-full">
            
            {/* Scalloped Perforation Holes Simulator (Top, Bottom, Left, Right) */}
            <div className="absolute -inset-1 border-2 border-dashed border-[#d8b4fe] rounded-2xl pointer-events-none opacity-60" />

            {/* Inner Stamp Canvas Area */}
            <div className="relative bg-gradient-to-br from-[#faf5ff] via-[#f5f3ff] to-[#ede9fe] rounded-xl p-3 sm:p-3.5 border border-purple-200/60 overflow-hidden space-y-2">
              
              {/* Header inside Stamp (Top-Left Title & Top-Right Postmark) */}
              <div className="flex items-start justify-between">
                {/* Stamp Top-Left Title */}
                <div className="text-left font-black text-xs text-slate-900 leading-tight">
                  <p>{isGPay ? 'Gpay' : 'PhonePe'}</p>
                  <p className="text-[#6b21a8] font-extrabold">QR Code</p>
                </div>

                {/* Vintage Circular Postmark Cancellation Stamp Watermark */}
                <div className="relative opacity-70 transform rotate-12 -mr-1 -mt-1 select-none pointer-events-none">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-purple-400 flex flex-col items-center justify-center text-[6.5px] font-black text-purple-700 tracking-tighter uppercase leading-none p-1">
                    <span>★ PR YOUTH ★</span>
                    <span className="text-[5.5px] font-bold text-purple-500">ORIGINAL</span>
                    <span>2026</span>
                  </div>
                </div>
              </div>

              {/* Center QR Code Image with Clean Crisp Frame */}
              <div className="flex justify-center py-1">
                <div className="relative bg-white p-2 rounded-xl shadow-md border border-purple-200/80">
                  <img
                    src={qrImage}
                    alt={`${isGPay ? 'GPay' : 'PhonePe'} QR Code`}
                    className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg select-none"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Bottom Row inside Stamp (Stamp Number & Footer note) */}
              <div className="flex items-center justify-between text-[8.5px] font-bold text-purple-800/80 pt-1">
                <span className="text-sm font-black text-slate-900">{stampNumber}</span>
                <span className="text-[7.5px] font-semibold text-slate-500 truncate max-w-[170px]">
                  {payeeName}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* UPI ID & One-Tap Copy Section Underneath the Stamp */}
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs group"
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
            Scan using Google Pay, PhonePe, Paytm, or BHIM
          </p>
        </div>

        {/* Bottom Action Button: Click to back (Solid Black Pill Button) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3.5 sm:py-4 px-6 rounded-full bg-[#18181b] hover:bg-black text-white font-black text-sm shadow-xl shadow-slate-900/20 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Click to back</span>
          </button>
        </div>

      </div>
    </div>
  );
}
