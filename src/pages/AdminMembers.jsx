import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Users, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export function AdminMembers() {
  const { refreshTrigger } = useAuth();
  const [members, setMembers] = useState(() => {
    const cached = sessionStorage.getItem('ADMIN_MEMBERS_DATA');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(members.length === 0);

  useEffect(() => {
    loadMembers();
  }, [refreshTrigger]);

  const loadMembers = async () => {
    try {
      const res = await api.getMembers();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setMembers(res.data);
        sessionStorage.setItem('ADMIN_MEMBERS_DATA', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to load members list', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-container py-6 sm:py-10 space-y-6">
      {/* Standalone Logo on Top */}
      <div className="flex items-center justify-center pt-2">
        <img
          src="/Logo.png"
          alt="PR Youth Logo"
          className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-md hover:scale-105 transition-transform"
        />
      </div>

      {/* Clean Centered Title */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight flex items-center justify-center gap-2">
          <Users className="w-6 h-6 text-[#0f52ba] shrink-0" />
          <span>Members Directory</span>
        </h1>
      </div>

      {/* Segmented Navigation Tab Bar */}
      <Navbar />

      {/* Members Directory List Card */}
      <div className="reference-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <h2 className="text-sm sm:text-base font-bold text-[#0f172a] truncate">
            Active Members ({members.length})
          </h2>
          <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full font-semibold shrink-0">
            via Google Sheets
          </span>
        </div>

        {loading && members.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="space-y-2.5">
            {members.map((m) => {
              const statusStr = String(m.status || '').toLowerCase();
              const activeVal = String(m.active).toLowerCase();
              const isActive =
                statusStr === 'active' ||
                activeVal === 'true' ||
                activeVal === '1' ||
                m.active === true;

              return (
                <div
                  key={m.memberId || m.name}
                  className="apple-card p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0f52ba] border border-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
                      {m.name ? m.name.charAt(0).toUpperCase() : 'M'}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-[#0f172a] truncate">{m.name}</span>
                        {m.role === 'Admin' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" title="Administrator" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-400 truncate">
                        {m.memberId || 'Member ID'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Inactive</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No members found in Google Sheet.</p>
        )}
      </div>
    </div>
  );
}
