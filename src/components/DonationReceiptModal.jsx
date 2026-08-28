import React, { useState } from 'react';
import { createDonationReceiptCanvas } from '../utils/donationReceiptCanvas';
import { triggerHaptic } from '../utils/hapticsSound';
import { X, Download, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export function DonationReceiptModal({ isOpen, onClose, donation }) {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-sm sm:max-w-md overflow-hidden my-auto relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={() => {
            triggerHaptic(10);
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Accent Stripe */}
        <div className="h-1.5 w-full bg-[#0f52ba]" />

        {/* Receipt Card Content */}
        <div className="p-5 sm:p-7 space-y-4 text-center">
          
          {/* Circular Logo Emblem */}
          <div className="flex justify-center">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-blue-50/80 border-2 border-blue-200 flex items-center justify-center shadow-inner p-2">
              <img
                src="/Logo.png"
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
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
              Penumuli Village, Duggirala Mandal, Guntur District
            </p>
            <div className="pt-1 flex justify-center">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official Donation Receipt</span>
              </span>
            </div>
          </div>

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-slate-200 my-1" />

          {/* Receipt Key Metadata Details (Receipt No Removed) */}
          <div className="space-y-2 text-xs text-left bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
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
              <span className="font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[11px]">
                {paymentMethod}
              </span>
            </div>
          </div>

          {/* Formal Contribution Statement Box (Highlighted Orange Donor Name) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 text-left space-y-1.5 shadow-2xs">
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
              <span className="font-bold text-slate-900">Mr/Miss: </span>
              <span className="font-black text-orange-600 text-[13.5px] sm:text-sm tracking-tight">
                {donorName}
              </span>{' '}
              has generously contributed an amount of{' '}
              <span className="font-extrabold text-emerald-700">₹{amount.toLocaleString('en-IN')}</span> towards the{' '}
              <span className="font-bold text-slate-800">Vinayaka festival / Puja</span>, and the amount has been received with heartfelt thanks.
            </p>
          </div>

          {/* Highlighted Amount Badge */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-center space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              Amount Received
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              ₹{amount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Thanking Note */}
          <p className="text-xs font-bold text-[#0f52ba]">
            Thanking you for your contribution.
          </p>

          {/* Export / Download PNG Button */}
          <div className="pt-1">
            <button
              onClick={handleExportReceipt}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-2xl bg-[#0f52ba] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Receipt...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </>
              )}
            </button>

            {downloadSuccess && (
              <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5 animate-pulse">
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
