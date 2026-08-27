import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Toast } from '../components/ui/Toast';
import { Users, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await api.getMembers();
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch (err) {
      console.error('Failed to load members list', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (memberId, currentStatus) => {
    const nextStatus = currentStatus === 'Inactive' ? 'Active' : 'Inactive';
    try {
      const res = await api.toggleMemberStatus(memberId, nextStatus);
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) =>
            m.memberId === memberId
              ? { ...m, status: nextStatus, active: nextStatus === 'Active' }
              : m
          )
        );
        setToastMessage({
          type: 'success',
          text: `Member status updated to ${nextStatus}!`,
        });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: 'Failed to update member status.' });
    }
  };

  return (
    <div className="centered-container py-6 sm:py-10 space-y-6">
      {/* 1. Standalone Logo on Top */}
      <div className="flex items-center justify-center pt-2">
        <img
          src="/Logo.png"
          alt="PR Youth Logo"
          className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-md hover:scale-105 transition-transform"
        />
      </div>

      {/* 2. Header */}
      <div className="text-center space-y-1 border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight flex items-center justify-center gap-2">
          <Users className="w-6 h-6 text-[#0f52ba]" />
          Committee Members Directory
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Active committee members &amp; status management.
        </p>
      </div>

      {/* 3. Segmented Navigation Tab Bar */}
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
          autoHideDuration={3000}
        />
      )}

      {/* 4. Members Directory List Card */}
      <div className="reference-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#0f172a]">Active Members ({members.length})</h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0f52ba] border border-blue-200">
            Live Directory
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((mem) => {
              const statusStr = String(mem.status || '').toLowerCase();
              const activeVal = String(mem.active).toLowerCase();
              const isActive =
                statusStr === 'active' ||
                activeVal === 'true' ||
                activeVal === '1' ||
                mem.active === true;

              const currentStatusText = isActive ? 'Active' : 'Inactive';

              return (
                <div
                  key={mem.memberId}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-[#0f52ba]/40 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0f52ba] flex items-center justify-center font-bold text-sm border border-blue-200 shrink-0">
                      {mem.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                        <span>{mem.name}</span>
                        {mem.role === 'Admin' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{mem.memberId}</div>
                    </div>
                  </div>

                  {/* Interactive Status Badge: Green for Active, Red for Inactive */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(mem.memberId, currentStatusText)}
                    title="Click to toggle status (Active <-> Inactive)"
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
