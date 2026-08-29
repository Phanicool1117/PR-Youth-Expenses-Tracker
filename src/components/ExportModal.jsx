import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import { createReportCanvas } from '../utils/reportCanvasGenerator';
import { triggerHaptic } from '../utils/hapticsSound';
import { LOGO_BASE64 } from '../utils/logoBase64';
import { X, FileText, Image as ImageIcon, Download, Loader2, CheckCircle2, Eye } from 'lucide-react';

export function ExportModal({ isOpen, onClose, transactions = [], title = "Committee Financial Audit Activity" }) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Mobile Hardware / Gesture Back Button Handling (Safe & persistent)
  useEffect(() => {
    if (!isOpen) return;

    try {
      window.history.pushState({ modalOpen: 'exportModal' }, '');
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
    if (window.history.state?.modalOpen === 'exportModal') {
      window.history.back();
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Financial Ledger Totals for Exported Table
  let totalDonations = 0;
  let totalExpenses = 0;

  transactions.forEach((tx) => {
    const isDonation = tx.type === 'Donation' || tx.type === 'Donations' || Boolean(tx.donorName);
    const amt = Number(tx.amount || 0);
    if (isDonation) totalDonations += amt;
    else totalExpenses += amt;
  });

  const netBalance = totalDonations - totalExpenses;

  // Helper to trigger file download safely across all browsers
  const downloadBlob = (blob, fileName) => {
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
  };

  // Check 20-transaction threshold and ask user if > 20 entries
  const confirmPageLength = () => {
    if (transactions.length > 20) {
      const confirmProceed = window.confirm(
        `Notice: This audit report contains ${transactions.length} transactions and will be generated into 2 or more pages.\n\nClick OK to proceed with downloading the multi-page report.`
      );
      return confirmProceed;
    }
    return true;
  };

  // 1. Export High-Resolution PNG via HTML5 Canvas (with Top Right Logo)
  const handleExportPng = async () => {
    triggerHaptic(15);
    setIsExportingPng(true);
    setSuccessMsg('');

    try {
      const canvas = await createReportCanvas(transactions, title, formattedDate);
      const fileName = `PR_Youth_Audit_Report_${Date.now()}.png`;

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, fileName);
          setSuccessMsg('Report PNG downloaded successfully!');
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setSuccessMsg('Report PNG downloaded successfully!');
          setTimeout(() => setSuccessMsg(''), 4000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to export PNG audit report', err);
      alert('Could not download PNG report. Please try again.');
    } finally {
      setIsExportingPng(false);
    }
  };

  // 2. Export Crisp Multi-Page Vector PDF via jsPDF (with Top Right Logo)
  const handleExportPdf = async () => {
    triggerHaptic(15);
    const ok = confirmPageLength();
    if (!ok) return;

    setIsExportingPdf(true);
    setSuccessMsg('');

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      // Color Palette matching PR Youth theme
      const primaryColor = [15, 82, 186]; // #0f52ba
      const darkColor = [15, 23, 42]; // #0f172a
      const slateColor = [100, 116, 139]; // #64748b
      const emeraldColor = [5, 150, 105]; // #059669
      const roseColor = [225, 29, 72]; // #e11d48
      const lightBg = [248, 250, 252]; // #f8fafc

      const drawHeader = (pageNumber) => {
        // Top accent stripe
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 5, 'F');

        // Draw Emblem Logo on Top Right
        try {
          doc.addImage(LOGO_BASE64, 'PNG', pageWidth - margin - 46, 20, 46, 46);
        } catch (e) {
          console.warn('PDF logo draw skipped', e);
        }

        // Header Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(...darkColor);
        doc.text('Penumuli Perantalamma Youth Tracker', margin, 38);

        // Subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...slateColor);
        doc.text('Penumuli Village, Duggirala Mandal, Guntur District', margin, 50);

        // Report Title & Date
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text(`${title} Report`, margin, 70);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...slateColor);
        doc.text(`Generated on: ${formattedDate}`, margin, 84);

        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(1);
        doc.line(margin, 92, pageWidth - margin, 92);
      };

      const drawFooter = (pageNum) => {
        const footY = pageHeight - 24;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...slateColor);
        doc.text('Penumuli Youth Committee · Official Financial Audit Report', margin, footY);
        doc.text(`Page ${pageNum}`, pageWidth - margin, footY, { align: 'right' });
      };

      // PAGE 1: Header + Summary + Transactions Table
      drawHeader(1);

      // Financial Summary Box (Page 1 only)
      let curY = 102;
      doc.setFillColor(...lightBg);
      doc.roundedRect(margin, curY, contentWidth, 52, 6, 6, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, curY, contentWidth, 52, 6, 6, 'S');

      const colW = contentWidth / 3;

      // Col 1: Total Donations
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...emeraldColor);
      doc.text('TOTAL DONATIONS', margin + 14, curY + 18);
      doc.setFontSize(12.5);
      doc.text(`+ Rs. ${totalDonations.toLocaleString('en-IN')}`, margin + 14, curY + 38);

      // Col 2: Total Expenses
      doc.setFontSize(7.5);
      doc.setTextColor(...roseColor);
      doc.text('TOTAL EXPENSES', margin + colW + 14, curY + 18);
      doc.setFontSize(12.5);
      doc.text(`- Rs. ${totalExpenses.toLocaleString('en-IN')}`, margin + colW + 14, curY + 38);

      // Col 3: Net Balance
      doc.setFontSize(7.5);
      doc.setTextColor(...primaryColor);
      doc.text('NET BALANCE', margin + colW * 2 + 14, curY + 18);
      doc.setFontSize(12.5);
      doc.text(`Rs. ${netBalance.toLocaleString('en-IN')}`, margin + colW * 2 + 14, curY + 38);

      curY = 168;

      // Table Header Function
      const drawTableHeader = (y) => {
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 22, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...darkColor);

        doc.text('Date', margin + 8, y + 14);
        doc.text('Category / Donor', margin + 95, y + 14);
        doc.text('Member / Note', margin + 250, y + 14);
        doc.text('Method', margin + 395, y + 14);
        doc.text('Amount', pageWidth - margin - 8, y + 14, { align: 'right' });

        doc.setDrawColor(203, 213, 225);
        doc.line(margin, y + 22, pageWidth - margin, y + 22);
      };

      drawTableHeader(curY);
      curY += 22;

      let currentPage = 1;
      const rowHeight = 22;
      const maxY = pageHeight - 48;

      transactions.forEach((tx, i) => {
        if (curY + rowHeight > maxY) {
          drawFooter(currentPage);
          doc.addPage();
          currentPage += 1;
          drawHeader(currentPage);
          curY = 104;
          drawTableHeader(curY);
          curY += 22;
        }

        const isDonation = tx.type === 'Donation' || tx.type === 'Donations' || Boolean(tx.donorName);
        const amt = Number(tx.amount || 0);

        if (i % 2 === 1) {
          doc.setFillColor(250, 250, 252);
          doc.rect(margin, curY, contentWidth, rowHeight, 'F');
        }

        const txDate = tx.timestamp ? new Date(tx.timestamp) : new Date();
        const dateStr = txDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

        const catStr = isDonation
          ? `Donation (${tx.donorName || tx.name || 'Anonymous'})`
          : (tx.category || 'Expense');

        const memberStr = isDonation
          ? 'Central Donation'
          : (tx.memberName ? `${tx.memberName}` : (tx.note || '-'));

        const methodStr = tx.paymentMethod || 'Cash';

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...darkColor);
        doc.text(dateStr, margin + 8, curY + 14);

        const catClean = doc.splitTextToSize(catStr, 145)[0];
        doc.text(catClean, margin + 95, curY + 14);

        const memClean = doc.splitTextToSize(memberStr, 135)[0];
        doc.text(memClean, margin + 250, curY + 14);

        doc.text(methodStr, margin + 395, curY + 14);

        doc.setFont('helvetica', 'bold');
        if (isDonation) {
          doc.setTextColor(...emeraldColor);
          doc.text(`+ Rs. ${amt.toLocaleString('en-IN')}`, pageWidth - margin - 8, curY + 14, { align: 'right' });
        } else {
          doc.setTextColor(...roseColor);
          doc.text(`- Rs. ${amt.toLocaleString('en-IN')}`, pageWidth - margin - 8, curY + 14, { align: 'right' });
        }

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, curY + rowHeight, pageWidth - margin, curY + rowHeight);

        curY += rowHeight;
      });

      drawFooter(currentPage);

      const fileName = `PR_Youth_Audit_Report_${Date.now()}.pdf`;
      doc.save(fileName);

      setSuccessMsg('Report PDF downloaded successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to export PDF audit report', err);
      alert('Could not download PDF report. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl md:max-w-2xl overflow-hidden my-auto relative animate-scale-up max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer absolute top-3.5 right-3.5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Royal Blue Accent Stripe */}
        <div className="h-1.5 w-full bg-[#0f52ba] shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0f52ba] border border-blue-200 flex items-center justify-center shadow-2xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
                Export Financial Audit Report
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {transactions.length} total records · Live preview below
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Live Report Preview Box */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-50/60 space-y-4">
          
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#0f52ba]" />
            <span>Interactive Report Preview</span>
          </div>

          {/* THE OFFICIAL REPORT PREVIEW SHEET */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4 text-left">
            
            {/* Header with Title on Left & Logo on Right */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a]">
                  Penumuli Perantalamma Youth Tracker
                </h3>
                <p className="text-xs font-semibold text-[#0f52ba]">
                  {title} Report
                </p>
                <p className="text-[11px] text-slate-500">
                  Generated on: <span className="font-semibold text-slate-700">{formattedDate}</span>
                </p>
              </div>

              {/* Logo Emblem on Top Right */}
              <div className="w-14 h-14 rounded-full bg-blue-50/80 border-2 border-blue-200 flex items-center justify-center p-1 shadow-inner shrink-0">
                <img
                  src={LOGO_BASE64}
                  alt="PR Youth Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Financial Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">Total Donations</span>
                <span className="text-base font-extrabold text-emerald-700">+ ₹{totalDonations.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] font-extrabold text-rose-800 uppercase block">Total Expenses</span>
                <span className="text-base font-extrabold text-rose-700">- ₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-extrabold text-blue-800 uppercase block">Net Balance</span>
                <span className="text-base font-extrabold text-[#0f52ba]">₹{netBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Transactions Mini Table Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/90 px-3 py-2 text-[11px] font-bold text-slate-700 flex justify-between">
                <span>Transaction & Category</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {transactions.map((tx, idx) => {
                  const isDonation = tx.type === 'Donation' || tx.type === 'Donations' || Boolean(tx.donorName);
                  const amt = Number(tx.amount || 0);
                  return (
                    <div key={idx} className="p-2.5 text-xs flex justify-between items-center hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">
                          {isDonation ? `Donation: ${tx.donorName || 'Donor'}` : (tx.category || 'Expense')}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''} · {tx.paymentMethod || 'Cash'}
                        </p>
                      </div>
                      <span className={`font-extrabold ${isDonation ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {isDonation ? '+ ' : '- '}₹{amt.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview Footer Note */}
            <div className="text-center pt-1 text-[10.5px] text-slate-400">
              Penumuli Youth Committee · Authorized Financial Audit Report
            </div>

          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-2 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 1. Download PDF Report Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || isExportingPng}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>

            {/* 2. Download PNG Image Button */}
            <button
              onClick={handleExportPng}
              disabled={isExportingPng || isExportingPdf}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0f52ba] hover:bg-blue-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isExportingPng ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PNG...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Download PNG Image</span>
                </>
              )}
            </button>
          </div>

          {successMsg && (
            <div className="pt-1 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
