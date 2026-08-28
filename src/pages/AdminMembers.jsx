import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Users, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <h3 className="text-sm sm:text-base font-bold text-[#0f172a] whitespace-nowrap">
            Active Members ({members.length})
          </h3>
          <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0f52ba] border border-blue-200 shrink-0 whitespace-nowrap">
            via Google Sheets
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

                  {/* Read-Only Status Badge (Managed in Google Sheets) */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
