import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function CustomSelect({ value, onChange, options = [], icon: Icon, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) =>
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const getLabel = (opt) => (typeof opt === 'object' ? opt.label : opt);
  const getValue = (opt) => (typeof opt === 'object' ? opt.value : opt);

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
          {Icon && <Icon className="apple-input-icon" />}
          <span className="truncate text-[#0f172a]">
            {selectedOption ? getLabel(selectedOption) : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#0284c7]' : ''}`} />
      </button>

      {/* Shadcn Animated Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 max-h-60 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-100">
          {options.map((opt) => {
            const val = getValue(opt);
            const lbl = getLabel(opt);
            const isSelected = val === value;

            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-xs text-left font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-[#0f52ba] font-bold'
                    : 'text-[#0f172a] hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{lbl}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0f52ba] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
