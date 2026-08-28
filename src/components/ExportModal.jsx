import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { triggerHaptic } from '../utils/hapticsSound';
import { X, FileText, Image as ImageIcon, Download, Loader2, CheckCircle2 } from 'lucide-react';

export function ExportModal({ isOpen, onClose, transactions = [], title = "Committee Financial Audit Activity" }) {
  const printRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  // Handle PDF Export
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    triggerHaptic(15);
    setIsExportingPdf(true);
    setSuccessMsg('');

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PR_Youth_Audit_Report_${Date.now()}.pdf`);

      setSuccessMsg('PDF Report downloaded successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to export PDF', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle PNG Export
  const handleExportPNG = async () => {
    if (!printRef.current) return;
    triggerHaptic(15);
    setIsExportingPng(true);
    setSuccessMsg('');

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `PR_Youth_Audit_Report_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setSuccessMsg('PNG Image downloaded successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to export PNG', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
              <Download className="w-5 h-5 text-[#0f52ba]" />
              Export Financial Audit Receipt Report
            </h3>
            <p className="text-xs text-slate-500 font-medium">Select PDF or PNG format to download audit receipts</p>
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

        {/* Action Buttons Toolbar */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf || isExportingPng}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f52ba] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Export Document Printable Template (Ref: Payslip / Official Audit Layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100">
          <div
            ref={printRef}
            className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-md space-y-6 mx-auto max-w-3xl"
            style={{ width: '100%', minHeight: '600px' }}
          >
            {/* Header: Company / Organization Logo & Title */}
            <div className="flex items-start justify-between border-b-2 border-slate-200 pb-6 gap-4">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight">
                  Penumuli Perantalamma Youth Tracker
                </h1>
                <p className="text-sm font-bold text-[#0f52ba]">
                  {title}
                </p>
                <div className="text-xs text-slate-500 font-medium pt-1 space-y-0.5">
                  <p>Generated Date: <span className="font-semibold text-slate-700">{formattedDate}</span></p>
                  <p>Generated By: <span className="font-semibold text-slate-700">Executive Committee Admin</span></p>
                </div>
              </div>

              {/* App Emblem Logo */}
              <div className="shrink-0">
                <img
                  src="/Logo.png"
                  alt="App Logo"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-sm"
                />
              </div>
            </div>

            {/* Financial Ledger Summary Cards Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Total Donations</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-700">₹{totalDonations.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">Total Expenses</span>
                <span className="text-base sm:text-lg font-extrabold text-rose-700">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider block">Net Balance</span>
                <span className="text-base sm:text-lg font-extrabold text-blue-700">₹{netBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Structured Transactions Audit Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                Transaction Audit Records ({transactions.length} Entries)
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Date & Time</th>
                      <th className="p-2.5">Category / Entry</th>
                      <th className="p-2.5">Member / Donor</th>
                      <th className="p-2.5">Mode</th>
                      <th className="p-2.5 text-right">Amount (₹)</th>
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
                          <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 whitespace-nowrap text-[11px]">{txDate}</td>
                          <td className="p-2.5 font-bold text-[#0f172a]">
                            {isDonation ? `Donation (${tx.donorName || 'Donor'})` : tx.category}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {isDonation ? (tx.donorName || 'Anonymous') : `${tx.memberName || 'Member'} (${tx.memberId || 'ID'})`}
                          </td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200">
                              {tx.paymentMethod || 'Cash'}
                            </span>
                          </td>
                          <td className={`p-2.5 text-right font-extrabold text-sm ${isDonation ? 'text-emerald-600' : 'text-rose-600'}`}>
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
