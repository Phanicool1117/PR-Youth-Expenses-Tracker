import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function CustomDatePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const isoDate = d.toISOString().split('T')[0];
    onChange(isoDate);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const isoDate = today.toISOString().split('T')[0];
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(isoDate);
    setIsOpen(false);
  };

  const formattedDisplay = value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Select date';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full apple-input apple-input-with-icon font-semibold text-xs py-3 text-left flex items-center justify-between transition-all ${
          isOpen ? 'border-[#0284c7] ring-2 ring-[#0284c7]/15 bg-white' : 'bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          <CalendarIcon className="apple-input-icon text-[#0f52ba]" />
          <span className="truncate text-[#0f172a]">{formattedDisplay}</span>
        </div>
      </button>

      {/* Shadcn Popover Calendar Container */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 w-72 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Calendar Month & Year Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs text-[#0f172a]">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
              <span key={w} className="text-[10px] font-bold text-slate-400">
                {w}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty slots for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getFullYear() === viewYear;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 rounded-xl font-semibold flex items-center justify-center mx-auto transition-all ${
                    isSelected
                      ? 'bg-[#0f52ba] text-white font-bold shadow-sm'
                      : 'text-[#0f172a] hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action */}
          <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-xs font-bold text-[#0f52ba] hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
