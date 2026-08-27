import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose, autoHideDuration = 1200 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 150); // Fast 150ms fade-out transition
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [message, autoHideDuration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`transition-all duration-150 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
      }`}
    >
      <div
        className={`p-3 px-4 rounded-2xl shadow-xl border flex items-center justify-between gap-3 backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900 shadow-emerald-500/10'
            : 'bg-rose-50/95 border-rose-300 text-rose-900 shadow-rose-500/10'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-bold truncate">{message}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              if (onClose) onClose();
            }, 150);
          }}
          className="p-1 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
