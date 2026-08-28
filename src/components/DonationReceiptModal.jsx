import React, { useState } from 'react';
import { createDonationReceiptCanvas } from '../utils/donationReceiptCanvas';
import { triggerHaptic } from '../utils/hapticsSound';
import { LOGO_BASE64 } from '../utils/logoBase64';
import { X, Download, Share2, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export function DonationReceiptModal({ isOpen, onClose, donation }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen || !donation) return null;

  const donorName = donation.donorName || donation.name || 'Anonymous Donor';
  const amount = Number(donation.amount || 0);
  const paymentMethod = donation.paymentMethod || 'UPI / Cash';

  const txDate = donation.timestamp ? new Date(donation.timestamp) : new Date();
  const dateFormatted = txDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = txDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Handle Export / Download PNG directly
  const handleExportReceipt = async () => {
    triggerHaptic(15);
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const canvas = await createDonationReceiptCanvas(donation);
      const fileName = `Donation_Receipt_${donorName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;

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
          // Data URL fallback
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
      const fileName = `Donation_Receipt_${donorName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }

        const file = new File([blob], fileName, { type: 'image/png' });
        const shareText = `*Official Donation Receipt*\nPenumuli Perantalamma Youth\n\nDonor: ${donorName}\nAmount: ₹${amount.toLocaleString('en-IN')}\nDate: ${dateFormatted}\n\nThanking you for your generous contribution towards Lord Vinayaka Festival! 🙏`;

        // Check if Web Share API with files is supported
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Penumuli Perantalamma Youth - Donation Receipt',
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
              title: 'Penumuli Perantalamma Youth - Donation Receipt',
              text: shareText,
            });
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 4000);
          } catch (shareErr) {
            console.warn('Text share failed', shareErr);
          }
        } else {
          // Direct fallback: Download image and copy summary text to clipboard
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-sm sm:max-w-md overflow-hidden my-auto relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={() => {
            triggerHaptic(10);
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Royal Blue Accent Stripe */}
        <div className="h-1.5 w-full bg-[#0f52ba]" />

        {/* Receipt Card Content */}
        <div className="p-6 sm:p-7 space-y-4 text-center bg-white">
          
          {/* Circular Logo Emblem */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-50/80 border-2 border-blue-200 flex items-center justify-center shadow-inner p-1.5">
              <img
                src={LOGO_BASE64}
                alt="PR Youth Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Heading & Tagline */}
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight">
              Penumuli Perantalamma Youth
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Penumuli Village, Duggirala Mandal, Guntur District
            </p>
            <div className="pt-1 flex justify-center">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>OFFICIAL DONATION RECEIPT</span>
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="py-0.5">
            <div className="border-t border-dashed border-slate-200" />
          </div>

          {/* Secondary Metadata Details (Date, Paid At, Method) */}
          <div className="space-y-2 text-xs text-left bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium text-xs">Date</span>
              <span className="font-bold text-[#0f172a] text-xs">{dateFormatted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium text-xs">Paid At</span>
              <span className="font-bold text-[#0f172a] text-xs">{timeFormatted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium text-xs">Payment Method</span>
              <span className="font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-xs">
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
          <div className="py-2 px-1 text-center space-y-1">
            <p className="text-base sm:text-[17px] text-slate-700 leading-relaxed font-normal text-center">
              <span className="font-bold text-slate-900">Mr/Miss: </span>
              <span className="font-black text-orange-600 text-lg sm:text-xl tracking-tight">
                {donorName}
              </span>{' '}
              has generously contributed an amount of{' '}
              <span className="font-black text-emerald-700 text-lg sm:text-xl">₹{amount.toLocaleString('en-IN')}</span> towards the{' '}
              <span className="font-bold text-slate-900">Vinayaka festival / Puja</span>, and the amount has been received with heartfelt thanks.
            </p>
          </div>

          {/* Complementary Centered Amount Pill */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-300 shadow-2xs">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                Amount Received:
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-700 tracking-tight">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Thanking Note */}
          <div className="pt-2">
            <p className="text-sm sm:text-base font-bold text-[#0f52ba]">
              Thanking you for your contribution.
            </p>
          </div>

          {/* Official Footer Verification Note */}
          <div className="pt-2 pb-1 text-center space-y-0.5">
            <p className="text-[11px] font-semibold text-slate-500">
              Penumuli Youth Committee · Authorized Digital Receipt
            </p>
            <p className="text-[10px] text-slate-400">
              May Lord Ganesha shower blessings upon you and your family.
            </p>
          </div>

        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-5 pt-1 bg-white space-y-2 border-t border-slate-100">
          {/* Share Button (Top) */}
          <button
            onClick={handleShareReceipt}
            disabled={isSharing || isExporting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isSharing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Share...</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Receipt</span>
              </>
            )}
          </button>

          {/* Export / Download PNG Button (Below Share) */}
          <button
            onClick={handleExportReceipt}
            disabled={isExporting || isSharing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0f52ba] hover:bg-blue-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Receipt...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export PNG</span>
              </>
            )}
          </button>

          {shareSuccess && (
            <div className="pt-1 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Receipt shared successfully!</span>
            </div>
          )}

          {downloadSuccess && (
            <div className="pt-1 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Receipt PNG downloaded successfully!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
