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

  // Mobile Hardware / Gesture Back Button Handling
  useEffect(() => {
    if (!isOpen) return;

    let isPushed = false;
    try {
      window.history.pushState({ modal: 'exportModal' }, '');
      isPushed = true;
    } catch (e) {
      console.warn('History push failed', e);
    }

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (isPushed && window.history.state?.modal === 'exportModal') {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

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

  // Handle PDF Export
  const handleExportPDF = async () => {
    if (!confirmPageLength()) return;

    triggerHaptic(15);
    setIsExportingPdf(true);
    setSuccessMsg('');

    try {
      const canvas = await createReportCanvas(transactions, title, formattedDate);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const totalImgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (totalImgHeight <= pdfPageHeight || transactions.length <= 20) {
        // Fits entirely on a Single Page
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfPageHeight, totalImgHeight));
      } else {
        // Multi-page slicing for large lists
        let heightLeft = totalImgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
        heightLeft -= pdfPageHeight;

        while (heightLeft > 0) {
          position -= pdfPageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight);
          heightLeft -= pdfPageHeight;
        }
      }

      const fileName = `PR_Youth_Audit_Report_${Date.now()}.pdf`;
      const pdfBlob = pdf.output('blob');
      downloadBlob(pdfBlob, fileName);

      setSuccessMsg(
        transactions.length <= 20
          ? 'Single-Page PDF Report downloaded successfully!'
          : 'Multi-Page PDF Report downloaded successfully!'
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle PNG Export
  const handleExportPNG = async () => {
    if (!confirmPageLength()) return;

    triggerHaptic(15);
    setIsExportingPng(true);
    setSuccessMsg('');

    try {
      const canvas = await createReportCanvas(transactions, title, formattedDate);
      const fileName = `PR_Youth_Audit_Report_${Date.now()}.png`;

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, fileName);
          setSuccessMsg('PNG Report Image downloaded successfully!');
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setSuccessMsg('PNG Report Image downloaded successfully!');
          setTimeout(() => setSuccessMsg(''), 4000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to export PNG', err);
      alert('Could not generate PNG image. Please try again.');
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0f172a] flex items-center gap-2">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f52ba]" />
              Export Financial Audit Receipt Report
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              {transactions.length <= 20
                ? 'Single-Page Report (1–20 Transactions)'
                : `Multi-Page Notice: Report contains ${transactions.length} entries`}
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar (Download PDF & Download PNG ONLY - Printer Icon Removed) */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf || isExportingPng}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f52ba] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleExportPNG}
              disabled={isExportingPdf || isExportingPng}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isExportingPng ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              <span>Download PNG</span>
            </button>
          </div>

          {successMsg && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Scrollable Container for Document Preview */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-6 bg-slate-100/90">
          <div
            ref={printRef}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md space-y-6 mx-auto"
            style={{ width: '800px', minWidth: '800px', backgroundColor: '#ffffff' }}
          >
            {/* Header: Company / Organization Logo & Title */}
            <div className="flex items-start justify-between border-b-2 border-slate-200 pb-5 gap-6">
              <div className="space-y-1 max-w-[550px]">
                <h1 className="text-2xl font-black text-[#0f172a] tracking-tight leading-tight">
                  Penumuli Perantalamma Youth Tracker
                </h1>
                <p className="text-sm font-bold text-[#0f52ba]">
                  {title} Report
                </p>
                <div className="text-xs text-slate-500 font-medium pt-1.5 space-y-0.5">
                  <p>Generated Date: <span className="font-semibold text-slate-700">{formattedDate}</span></p>
                  <p>Generated By: <span className="font-semibold text-slate-700">Executive Committee Admin</span></p>
                </div>
              </div>

              {/* App Emblem Logo */}
              <div className="shrink-0 pt-1">
                <img
                  src={LOGO_BASE64}
                  alt="App Logo"
                  className="w-24 h-24 object-contain drop-shadow-xs"
                />
              </div>
            </div>

            {/* Financial Ledger Summary Cards Row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Total Donations</span>
                <span className="text-lg font-extrabold text-emerald-700">₹{totalDonations.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">Total Expenses</span>
                <span className="text-lg font-extrabold text-rose-700">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider block">Net Balance</span>
                <span className="text-lg font-extrabold text-blue-700">₹{netBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Structured Transactions Audit Table */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                Transaction Audit Records ({transactions.length} Entries)
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3 w-36">Date & Time</th>
                      <th className="p-3">Category / Entry</th>
                      <th className="p-3">Member / Donor</th>
                      <th className="p-3 w-20 text-center">Mode</th>
                      <th className="p-3 text-right w-28">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {transactions.map((tx, idx) => {
                      const isDonation = tx.type === 'Donation' || tx.type === 'Donations' || Boolean(tx.donorName);
                      const amt = Number(tx.amount || 0);

                      const txDate = tx.timestamp
                        ? new Date(tx.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '';

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 whitespace-nowrap text-[11px]">{txDate}</td>
                          <td className="p-3 font-bold text-[#0f172a]">
                            {isDonation ? `Donation (${tx.donorName || 'Donor'})` : tx.category}
                          </td>
                          <td className="p-3 text-slate-600">
                            {isDonation ? (tx.donorName || 'Anonymous') : `${tx.memberName || 'Member'} (${tx.memberId || 'ID'})`}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200">
                              {tx.paymentMethod || 'Cash'}
                            </span>
                          </td>
                          <td className={`p-3 text-right font-extrabold text-sm ${isDonation ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isDonation ? '+ ' : '- '}₹{amt.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Footer Verification Note */}
            <div className="pt-6 border-t border-slate-200 text-center space-y-1">
              <p className="text-[11px] font-semibold text-slate-500">
                Official Financial Audit Report · Penumuli Perantalamma Youth Team
              </p>
              <p className="text-[10px] text-slate-400">
                Generated automatically via Committee Expenses Tracker System
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
