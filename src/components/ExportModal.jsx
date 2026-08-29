import React, { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import { createReportCanvas } from '../utils/reportCanvasGenerator';
import { triggerHaptic } from '../utils/hapticsSound';
import { LOGO_BASE64 } from '../utils/logoBase64';
import { X, FileText, Image as ImageIcon, Download, Loader2, CheckCircle2 } from 'lucide-react';

export function ExportModal({ isOpen, onClose, transactions = [], title = "Committee Financial Audit Activity" }) {
  const printRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Mobile Hardware / Gesture Back Button Handling (Safe & persistent, never auto-closes)
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

  // 1. Export High-Resolution PNG via HTML5 Canvas
  const handleExportPng = async () => {
    triggerHaptic(15);
    setIsExportingPng(true);
    setSuccessMsg('');

    try {
      const canvas = await createReportCanvas(transactions, title);
      const fileName = `PR_Youth_Audit_Report_${Date.now()}.png`;

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, fileName);
          setSuccessMsg('Report PNG downloaded successfully!');
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          // Direct base64 fallback
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

  // 2. Export Crisp Multi-Page Vector PDF via jsPDF
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

      const drawHeader = (pageNumber, totalPagesEstimate) => {
        // Top accent stripe
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 5, 'F');

        // Header Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...darkColor);
        doc.text('Penumuli Perantalamma Youth', margin, 38);

        // Subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...slateColor);
        doc.text('Penumuli Village, Duggirala Mandal, Guntur District', margin, 50);

        // Report Title & Date
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        doc.text(title, margin, 70);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...slateColor);
        doc.text(`Generated on: ${formattedDate}`, pageWidth - margin, 70, { align: 'right' });

        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(1);
        doc.line(margin, 78, pageWidth - margin, 78);
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
      drawHeader(1, 1);

      // Financial Summary Box (Page 1 only)
      let curY = 90;
      doc.setFillColor(...lightBg);
      doc.roundedRect(margin, curY, contentWidth, 54, 6, 6, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, curY, contentWidth, 54, 6, 6, 'S');

      const colW = contentWidth / 3;

      // Col 1: Total Donations
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...emeraldColor);
      doc.text('TOTAL DONATIONS', margin + 14, curY + 18);
      doc.setFontSize(13);
      doc.text(`+ Rs. ${totalDonations.toLocaleString('en-IN')}`, margin + 14, curY + 38);

      // Col 2: Total Expenses
      doc.setFontSize(7.5);
      doc.setTextColor(...roseColor);
      doc.text('TOTAL EXPENSES', margin + colW + 14, curY + 18);
      doc.setFontSize(13);
      doc.text(`- Rs. ${totalExpenses.toLocaleString('en-IN')}`, margin + colW + 14, curY + 38);

      // Col 3: Net Balance
      doc.setFontSize(7.5);
      doc.setTextColor(...primaryColor);
      doc.text('NET BALANCE', margin + colW * 2 + 14, curY + 18);
      doc.setFontSize(13);
      doc.text(`Rs. ${netBalance.toLocaleString('en-IN')}`, margin + colW * 2 + 14, curY + 38);

      curY = 160;

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
      const maxY = pageHeight - 48; // bottom margin threshold

      transactions.forEach((tx, i) => {
        // If row will overflow page, create a new page
        if (curY + rowHeight > maxY) {
          drawFooter(currentPage);
          doc.addPage();
          currentPage += 1;
          drawHeader(currentPage, currentPage);
          curY = 90;
          drawTableHeader(curY);
          curY += 22;
        }

        const isDonation = tx.type === 'Donation' || tx.type === 'Donations' || Boolean(tx.donorName);
        const amt = Number(tx.amount || 0);

        // Alternating row background
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

        // Draw Row Cells
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...darkColor);
        doc.text(dateStr, margin + 8, curY + 14);

        // Truncate Category
        const catClean = doc.splitTextToSize(catStr, 145)[0];
        doc.text(catClean, margin + 95, curY + 14);

        // Truncate Note/Member
        const memClean = doc.splitTextToSize(memberStr, 135)[0];
        doc.text(memClean, margin + 250, curY + 14);

        // Method
        doc.text(methodStr, margin + 395, curY + 14);

        // Amount: Green for donation, Red for expense
        doc.setFont('helvetica', 'bold');
        if (isDonation) {
          doc.setTextColor(...emeraldColor);
          doc.text(`+ Rs. ${amt.toLocaleString('en-IN')}`, pageWidth - margin - 8, curY + 14, { align: 'right' });
        } else {
          doc.setTextColor(...roseColor);
          doc.text(`- Rs. ${amt.toLocaleString('en-IN')}`, pageWidth - margin - 8, curY + 14, { align: 'right' });
        }

        // Row bottom border
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
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-sm sm:max-w-md overflow-hidden my-auto relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer absolute top-3.5 right-3.5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Royal Blue Accent Stripe */}
        <div className="h-1.5 w-full bg-[#0f52ba]" />

        {/* Modal Header */}
        <div className="p-6 text-center space-y-2 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0f52ba] border border-blue-200 flex items-center justify-center mx-auto shadow-inner">
            <Download className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0f172a]">
              Export Financial Audit
            </h2>
            <p className="text-xs text-slate-500 font-medium pt-0.5">
              Choose your preferred format for the {transactions.length} record audit ledger.
            </p>
          </div>
        </div>

        {/* Export Options Grid */}
        <div className="p-6 space-y-3 bg-slate-50/50">
          {/* 1. PDF Vector Export */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || isExportingPng}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-red-300 hover:shadow-sm transition-all group active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[#0f172a] group-hover:text-red-600 transition-colors">
                  Download PDF Report
                </h4>
                <p className="text-xs text-slate-500">
                  {transactions.length > 20 ? 'Multi-page formatted table' : 'Single-page vector document'}
                </p>
              </div>
            </div>

            {isExportingPdf ? (
              <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
            )}
          </button>

          {/* 2. PNG Image Export */}
          <button
            onClick={handleExportPng}
            disabled={isExportingPng || isExportingPdf}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-sm transition-all group active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f52ba] border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[#0f172a] group-hover:text-[#0f52ba] transition-colors">
                  Download PNG Image
                </h4>
                <p className="text-xs text-slate-500">
                  High-definition screenshot snapshot
                </p>
              </div>
            </div>

            {isExportingPng ? (
              <Loader2 className="w-5 h-5 text-[#0f52ba] animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-slate-400 group-hover:text-[#0f52ba] transition-colors" />
            )}
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border-t border-emerald-200 flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

      </div>
    </div>
  );
}
