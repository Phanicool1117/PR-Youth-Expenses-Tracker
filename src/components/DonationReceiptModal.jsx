import React, { useEffect, useRef, useState } from 'react';
import { createDonationReceiptCanvas } from '../utils/donationReceiptCanvas';
import { triggerHaptic } from '../utils/hapticsSound';
import { LOGO_BASE64 } from '../utils/logoBase64';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { X, Download, Share2, Loader2, CheckCircle2, ShieldCheck, Flame, Award } from 'lucide-react';

export function DonationReceiptModal({ isOpen, onClose, donation }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Mobile Hardware / Gesture Back Button Handling (Safe & persistent)
  useEffect(() => {
    if (!isOpen) return;

    try {
      window.history.pushState({ modalOpen: 'donationReceipt' }, '');
    } catch (e) {
      console.warn('History push failed', e);
    }

    const handlePopState = () => {
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen]);

  const handleClose = () => {
    triggerHaptic(10);
    if (window.history.state?.modalOpen === 'donationReceipt') {
      window.history.back();
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen || !donation) return null;

  const donorName = donation.donorName || donation.name || 'Devotee';
  const amount = Number(donation.amount || 0);
  const paymentMethod = donation.paymentMethod || 'UPI / Cash';
  const isLaddu = donation.subType === 'Laddu' || String(donation.note || '').toLowerCase().includes('laddu');
  const gender = donation.gender || 'Male';

  // Dynamic prefix based on gender for Laddu or general default
  const titlePrefix = isLaddu
    ? gender === 'Female'
      ? 'Ms.'
      : 'Mr.'
    : donation.titlePrefix || 'Mr/Miss:';

  const dateFormatted = formatDate(donation.timestamp);
  const timeFormatted = formatTime(donation.timestamp);
  const amountFormatted = formatCurrency(amount);

  // Handle Export / Download PNG directly
  const handleExportReceipt = async () => {
    triggerHaptic(15);
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const canvas = await createDonationReceiptCanvas(donation);
      const fileName = `${isLaddu ? 'Laddu_Auction_Receipt' : 'Donation_Receipt'}_${donorName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);

          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 4000);
        } else {
          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 4000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to export donation receipt PNG', err);
      alert('Could not download receipt image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Native Share to WhatsApp, Telegram, System Share Sheet, etc.
  const handleShareReceipt = async () => {
    triggerHaptic(15);
    setIsSharing(true);
    setShareSuccess(false);

    try {
      const canvas = await createDonationReceiptCanvas(donation);
      const fileName = `${isLaddu ? 'Laddu_Receipt' : 'Donation_Receipt'}_${donorName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }

        const file = new File([blob], fileName, { type: 'image/png' });
        const shareText = isLaddu
          ? `*Sri Vinayaka Laddu Prasadam Auction Receipt*\nPenumuli Perantalamma Youth\n\nWinner: ${titlePrefix} ${donorName}\nWinning Amount: ₹${amountFormatted}\nDate: ${dateFormatted}\n\nHearty congratulations and divine blessings for winning the Holy Sri Vinayaka Laddu Prasadam! 🪔🙏`
          : `*Official Donation Receipt*\nPenumuli Perantalamma Youth\n\nDonor: ${donorName}\nAmount: ₹${amountFormatted}\nDate: ${dateFormatted}\n\nThanking you for your generous contribution towards Lord Vinayaka Festival! 🙏`;

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: isLaddu ? 'Sri Vinayaka Laddu Auction Receipt' : 'Penumuli Perantalamma Youth - Donation Receipt',
              text: shareText,
              files: [file],
            });
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 4000);
          } catch (shareErr) {
            if (shareErr.name !== 'AbortError') {
              console.warn('Share cancelled or failed', shareErr);
            }
          }
        } else if (navigator.share) {
          try {
            await navigator.share({
              title: isLaddu ? 'Sri Vinayaka Laddu Auction Receipt' : 'Penumuli Perantalamma Youth - Donation Receipt',
              text: shareText,
            });
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 4000);
          } catch (shareErr) {
            console.warn('Text share failed', shareErr);
          }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => document.body.removeChild(a), 1000);

          if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText);
            alert('Receipt downloaded and details copied to clipboard! You can paste and share it anywhere.');
          }
        }
        setIsSharing(false);
      }, 'image/png');
    } catch (err) {
      console.error('Failed to share donation receipt', err);
      setIsSharing(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[360px] sm:max-w-md overflow-hidden my-auto relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer absolute top-3 right-3"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Accent Stripe */}
        <div className={`h-1.5 w-full ${isLaddu ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-[#0f52ba]'}`} />

        {/* Receipt Card Content (Compact & Zero-Scroll Fit) */}
        <div className="p-4 sm:p-5 space-y-2 text-center bg-white">
          
          {/* Circular Logo Emblem */}
          <div className="flex justify-center">
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-inner p-1 ${
              isLaddu ? 'bg-amber-50 border-amber-200' : 'bg-blue-50/80 border-blue-200'
            }`}>
              <img
                src={LOGO_BASE64}
                alt="PR Youth Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Heading & Tagline */}
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0f172a] tracking-tight">
              Penumuli Perantalamma Youth
            </h2>
            <p className="text-[10.5px] font-semibold text-slate-500">
              Penumuli Village, Duggirala Mandal, Guntur District
            </p>
            <div className="pt-0.5 flex justify-center">
              {isLaddu ? (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  <Flame className="w-3 h-3 text-amber-600" />
                  <span>SRI VINAYAKA LADDU PRASADAM AUCTION RECEIPT</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>OFFICIAL DONATION RECEIPT</span>
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="py-0.5">
            <div className="border-t border-dashed border-slate-200" />
          </div>

          {/* Secondary Metadata Details (Date, Paid At, Method) */}
          <div className="space-y-1 text-[11px] text-left bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Date</span>
              <span className="font-bold text-[#0f172a]">{dateFormatted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Paid At</span>
              <span className="font-bold text-[#0f172a]">{timeFormatted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Payment Method</span>
              <span className="font-semibold px-2 py-0.2 rounded bg-white text-slate-700 border border-slate-200 text-[10px]">
                {paymentMethod}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="py-0.5">
            <div className="border-t border-dashed border-slate-200" />
          </div>

          {/* ========================================== */}
          {/* MAIN HERO DONATION CONTEXT (Center Aligned) */}
          {/* ========================================== */}
          <div className="py-1 px-1 text-center">
            {isLaddu ? (
              <p className="text-[13px] sm:text-sm text-slate-700 leading-snug font-normal text-center">
                <span className="font-bold text-slate-900">{titlePrefix} </span>
                <span className="font-black text-amber-700 text-sm sm:text-base tracking-tight">
                  {donorName}
                </span>{' '}
                has successfully won the Holy{' '}
                <span className="font-bold text-slate-900">Sri Vinayaka Laddu Prasadam</span> at the auction with an auspicious winning amount of{' '}
                <span className="font-black text-emerald-700 text-sm sm:text-base">₹{amountFormatted}</span>, received with heartfelt devotional blessings.
              </p>
            ) : (
              <p className="text-[13px] sm:text-sm text-slate-700 leading-snug font-normal text-center">
                <span className="font-bold text-slate-900">{titlePrefix} </span>
                <span className="font-black text-orange-600 text-sm sm:text-base tracking-tight">
                  {donorName}
                </span>{' '}
                has generously contributed an amount of{' '}
                <span className="font-black text-emerald-700 text-sm sm:text-base">₹{amountFormatted}</span> towards the{' '}
                <span className="font-bold text-slate-900">Vinayaka festival / Puja</span>, and the amount has been received with heartfelt thanks.
              </p>
            )}
          </div>

          {/* Complementary Centered Amount Pill */}
          <div className="flex justify-center pt-0.5">
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border shadow-2xs ${
              isLaddu ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-300'
            }`}>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                isLaddu ? 'text-amber-800' : 'text-emerald-800'
              }`}>
                {isLaddu ? 'Winning Amount:' : 'Amount Received:'}
              </span>
              <span className={`text-sm sm:text-base font-black tracking-tight ${
                isLaddu ? 'text-amber-800' : 'text-emerald-700'
              }`}>
                ₹{amountFormatted}
              </span>
            </div>
          </div>

          {/* Thanking Note */}
          <div className="py-1">
            <p className={`text-xs sm:text-sm font-bold ${isLaddu ? 'text-amber-700' : 'text-[#0f52ba]'}`}>
              {isLaddu ? 'Devotional blessings for your auspicious contribution.' : 'Thanking you for your contribution.'}
            </p>
          </div>

          {/* Official Footer Verification Note */}
          <div className="text-center space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-500">
              Penumuli Youth Committee · Authorized Digital Receipt
            </p>
            <p className="text-[9px] text-slate-400">
              May Lord Ganesha shower blessings upon you and your family.
            </p>
          </div>

        </div>

        {/* Action Buttons Toolbar (Snug & Instant) */}
        <div className="p-3 sm:p-4 pt-1 bg-white space-y-1.5 border-t border-slate-100">
          {/* Share Button (Top) */}
          <button
            onClick={handleShareReceipt}
            disabled={isSharing || isExporting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isSharing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Preparing Share...</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Receipt</span>
              </>
            )}
          </button>

          {/* Export / Download PNG Button (Below Share) */}
          <button
            onClick={handleExportReceipt}
            disabled={isExporting || isSharing}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer ${
              isLaddu ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#0f52ba] hover:bg-blue-700'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Receipt...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export PNG</span>
              </>
            )}
          </button>

          {shareSuccess && (
            <div className="pt-0.5 text-[11px] font-semibold text-emerald-700 flex items-center justify-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Receipt shared successfully!</span>
            </div>
          )}

          {downloadSuccess && (
            <div className="pt-0.5 text-[11px] font-semibold text-emerald-700 flex items-center justify-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Receipt PNG downloaded successfully!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
