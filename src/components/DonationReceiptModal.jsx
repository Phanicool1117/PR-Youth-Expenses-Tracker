import React, { useState } from 'react';
import { createDonationReceiptCanvas } from '../utils/donationReceiptCanvas';
import { triggerHaptic } from '../utils/hapticsSound';
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

  // Handle Export / Download PNG
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

        {/* Top Accent Stripe */}
        <div className="h-1.5 w-full bg-[#0f52ba]" />

        {/* Receipt Card Content */}
        <div className="p-5 sm:p-6 space-y-3 text-center">
          
          {/* Circular Logo Emblem */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-blue-50/80 border-2 border-blue-200 flex items-center justify-center shadow-inner p-1.5">
              <img
                src="/Logo.png"
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
            <p className="text-[11px] font-semibold text-slate-500">
              Penumuli Village, Duggirala Mandal, Guntur District
            </p>
            <div className="pt-0.5 flex justify-center">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>OFFICIAL DONATION RECEIPT</span>
              </span>
            </div>
          </div>

          {/* Symmetric Dashed Separator */}
          <div className="py-0.5">
            <div className="border-t border-dashed border-slate-200" />
          </div>

          {/* Receipt Key Metadata Details (Date, Paid At, Method) */}
          <div className="space-y-1.5 text-xs text-left bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100">
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
              <span className="font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10.5px]">
                {paymentMethod}
              </span>
            </div>
          </div>

          {/* Formal Contribution Statement Box (Fully occupied, no dead space) */}
          <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-200/80 text-left space-y-1 shadow-2xs">
            <p className="text-xs sm:text-[12px] text-slate-700 leading-relaxed font-medium">
              <span className="font-bold text-slate-900">Mr/Miss: </span>
              <span className="font-black text-orange-600 text-[12.5px] sm:text-xs tracking-tight">
                {donorName}
              </span>{' '}
              has generously contributed an amount of{' '}
              <span className="font-extrabold text-emerald-700">₹{amount.toLocaleString('en-IN')}</span> towards the{' '}
              <span className="font-bold text-slate-800">Vinayaka festival / Puja</span>, and the amount has been received with heartfelt thanks.
            </p>
          </div>

          {/* Tight, Content-Adapted Amount Box (Narrow sideways, zero excess width) */}
          <div className="flex justify-center pt-0.5">
            <div className="w-fit min-w-[210px] max-w-[250px] py-1.5 px-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-center space-y-0.5 shadow-2xs">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                DONATION CONTRIBUTION RECEIVED
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Thanking Note with Balanced Margins */}
          <div className="py-1">
            <p className="text-xs font-bold text-[#0f52ba]">
              Thanking you for your contribution.
            </p>
          </div>

          {/* Action Buttons: Share (On Top) & Export (Below) */}
          <div className="space-y-2 pt-1">
            {/* Share Button (Top) */}
            <button
              onClick={handleShareReceipt}
              disabled={isSharing || isExporting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#0f52ba] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
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
    </div>
  );
}
