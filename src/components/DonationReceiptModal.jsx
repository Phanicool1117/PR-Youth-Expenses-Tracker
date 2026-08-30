import React, { useEffect, useRef, useState } from 'react';
import { createDonationReceiptCanvas } from '../utils/donationReceiptCanvas';
import { triggerHaptic } from '../utils/hapticsSound';
import { LOGO_BASE64 } from '../utils/logoBase64';
import { MALE_AVATAR_BASE64, FEMALE_AVATAR_BASE64 } from '../utils/winnerAvatarsBase64';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { X, Download, Share2, Loader2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

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
  const paymentMethod = donation.paymentMethod || 'Cash';
  const isLaddu = donation.subType === 'Laddu' || String(donation.note || '').toLowerCase().includes('laddu') || donation.category === 'Laddu Prasadam Auction';
  const gender = donation.gender === 'Female' ? 'Female' : 'Male';

  // Dynamic prefix based on gender for Laddu or general default
  const titlePrefix = isLaddu
    ? gender === 'Female'
      ? 'Miss:'
      : 'Mr:'
    : donation.titlePrefix || 'Mr/Miss:';

  const avatarImg = gender === 'Female' ? FEMALE_AVATAR_BASE64 : MALE_AVATAR_BASE64;
  const avatarFallback = gender === 'Female' ? '/Female.png' : '/Male.png';

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
      const fileName = `${isLaddu ? 'Laddu_Winner_Receipt' : 'Donation_Receipt'}_${donorName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;

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
      const fileName = `${isLaddu ? 'Laddu_Winner_Receipt' : 'Donation_Receipt'}_${donorName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }

        const file = new File([blob], fileName, { type: 'image/png' });
        const shareText = isLaddu
          ? `*LADDU AUCTION WINNER RECEIPT*\n*Penumuli Perantalamma Youth*\n\n🎉 *Congratulations!*\n${titlePrefix} ${donorName}\nis the proud winner of the *Ganesh Laddu Auction!*\n\n*Winner Amount:* ₹${amountFormatted}\n*Payment Method:* ${paymentMethod}\n*Date:* ${dateFormatted}\n\nThanking you for being a part of our celebration. 🙏 May Lord Ganesha shower blessings upon you and your family!`
          : `*Official Donation Receipt*\n*Penumuli Perantalamma Youth*\n\nDonor: ${donorName}\nAmount: ₹${amountFormatted}\nDate: ${dateFormatted}\n\nThanking you for your generous contribution towards Lord Vinayaka Festival! 🙏`;

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: isLaddu ? 'Ganesh Laddu Auction Winner Receipt' : 'Penumuli Perantalamma Youth - Donation Receipt',
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
              title: isLaddu ? 'Ganesh Laddu Auction Winner Receipt' : 'Penumuli Perantalamma Youth - Donation Receipt',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[360px] sm:max-w-[390px] overflow-hidden my-auto relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer absolute top-3 right-3"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Accent Stripe */}
        <div className={`h-1.5 w-full ${isLaddu ? 'bg-[#0f52ba]' : 'bg-[#0f52ba]'}`} />

        {/* ========================================================================= */}
        {/* 1. DEDICATED LADDU AUCTION WINNER RECEIPT (Exact Match to Reference Image) */}
        {/* ========================================================================= */}
        {isLaddu ? (
          <div className="p-4 sm:p-5 space-y-2 text-center bg-white">
            {/* Top Logo Emblem */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full border border-blue-200 bg-blue-50/80 flex items-center justify-center p-1.5 shadow-inner">
                <img
                  src={LOGO_BASE64}
                  alt="PR Youth Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Header Text */}
            <div className="space-y-0.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight">
                Penumuli Perantalamma Youth
              </h2>
              <p className="text-[10.5px] font-semibold text-slate-500">
                Penumuli Village, Duggirala Mandal, Guntur District
              </p>
              <div className="pt-1 flex justify-center">
                <span className="inline-flex items-center text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] tracking-wider uppercase">
                  LADDU AUCTION WINNER RECEIPT
                </span>
              </div>
            </div>

            {/* Dashed Divider */}
            <div className="py-1">
              <div className="border-t border-dashed border-slate-200" />
            </div>

            {/* Hero Character Illustration (Male or Female with Celebration Aura) */}
            <div className="flex justify-center py-1">
              <div className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center p-2 ${
                gender === 'Female'
                  ? 'bg-gradient-to-b from-emerald-50/80 via-emerald-100/40 to-transparent'
                  : 'bg-gradient-to-b from-orange-50/80 via-orange-100/40 to-transparent'
              }`}>
                <img
                  src={avatarImg || avatarFallback}
                  alt={gender === 'Female' ? 'Female Winner' : 'Male Winner'}
                  className="w-full h-full object-contain drop-shadow-md select-none"
                  draggable={false}
                />
              </div>
            </div>

            {/* Congratulations & Devotee Title Section */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-800">
                <span className={gender === 'Female' ? 'text-emerald-500' : 'text-orange-500'}>✨</span>
                <span className="text-sm font-extrabold text-slate-900">Congratulations!</span>
                <span className={gender === 'Female' ? 'text-emerald-500' : 'text-orange-500'}>✨</span>
              </div>

              <div className="text-sm sm:text-base font-medium text-slate-800 leading-tight">
                <span className="font-extrabold text-[#0f172a]">{titlePrefix} </span>
                <span className="font-black text-[#ea580c] text-base sm:text-lg tracking-tight">
                  {donorName}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                is the proud winner of the
              </p>

              <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-black text-[#047857] tracking-tight">
                <span className="text-orange-500">✨</span>
                <span>Ganesh Laddu Auction!</span>
                <span className="text-orange-500">✨</span>
              </div>
            </div>

            {/* Winner Amount Pill */}
            <div className="flex justify-center pt-1.5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#047857]">
                  WINNER AMOUNT:
                </span>
                <span className="text-base sm:text-lg font-black text-[#065f46] tracking-tight">
                  ₹{amountFormatted}
                </span>
              </div>
            </div>

            {/* Thanking Note */}
            <div className="pt-2 pb-0.5">
              <p className="text-xs sm:text-[13px] font-bold text-[#0f52ba]">
                Thanking you for being a part of our celebration.
              </p>
            </div>

            {/* Official Verification Footer */}
            <div className="text-center space-y-0.5 pt-0.5">
              <p className="text-[10px] font-semibold text-slate-500">
                Penumuli Youth Committee · Authorized Digital Receipt
              </p>
              <p className="text-[9px] text-slate-400">
                May Lord Ganesha shower blessings upon you and your family.
              </p>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. STANDARD CHANDA (DONATION) RECEIPT                                     */
          /* ========================================================================= */
          <div className="p-4 sm:p-5 space-y-2 text-center bg-white">
            {/* Circular Logo Emblem */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full border border-blue-200 bg-blue-50/80 flex items-center justify-center p-1 shadow-inner">
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
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>OFFICIAL DONATION RECEIPT</span>
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="py-0.5">
              <div className="border-t border-dashed border-slate-200" />
            </div>

            {/* Metadata Box */}
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

            {/* Statement */}
            <div className="py-1 px-1 text-center">
              <p className="text-[13px] sm:text-sm text-slate-700 leading-snug font-normal text-center">
                <span className="font-bold text-slate-900">Mr/Miss: </span>
                <span className="font-black text-orange-600 text-sm sm:text-base tracking-tight">
                  {donorName}
                </span>{' '}
                has generously contributed an amount of{' '}
                <span className="font-black text-emerald-700 text-sm sm:text-base">₹{amountFormatted}</span> towards the{' '}
                <span className="font-bold text-slate-900">Vinayaka festival / Puja</span>, and the amount has been received with heartfelt thanks.
              </p>
            </div>

            {/* Amount Pill */}
            <div className="flex justify-center pt-0.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Amount Received:
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-700 tracking-tight">
                  ₹{amountFormatted}
                </span>
              </div>
            </div>

            {/* Thanking Note */}
            <div className="py-1">
              <p className="text-xs sm:text-sm font-bold text-[#0f52ba]">
                Thanking you for your contribution.
              </p>
            </div>

            {/* Verification Footer */}
            <div className="text-center space-y-0.5">
              <p className="text-[10px] font-semibold text-slate-500">
                Penumuli Youth Committee · Authorized Digital Receipt
              </p>
              <p className="text-[9px] text-slate-400">
                May Lord Ganesha shower blessings upon you and your family.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="p-3 sm:p-4 pt-1 bg-white space-y-1.5 border-t border-slate-100">
          {/* Share Button */}
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

          {/* Export / Download PNG Button */}
          <button
            onClick={handleExportReceipt}
            disabled={isExporting || isSharing}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0f52ba] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
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
