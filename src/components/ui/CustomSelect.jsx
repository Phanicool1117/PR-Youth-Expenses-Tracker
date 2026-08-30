import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function CustomSelect({ value, onChange, options = [], icon: FallbackIcon, placeholder = 'Select...' }) {
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
  const getIcon = (opt) => (typeof opt === 'object' && opt.icon ? opt.icon : null);

  const ActiveIcon = getIcon(selectedOption) || FallbackIcon;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full apple-input ${
          ActiveIcon ? 'apple-input-with-icon' : ''
        } font-semibold text-xs py-3 text-left flex items-center justify-between transition-all cursor-pointer ${
          isOpen ? 'border-[#0f52ba] ring-2 ring-[#0f52ba]/15 bg-white' : 'bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {ActiveIcon && (
            <ActiveIcon className="apple-input-icon text-slate-500" />
          )}
          <span className="truncate text-[#0f172a]">
            {selectedOption ? getLabel(selectedOption) : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#0f52ba]' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 max-h-60 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-100">
          {options.map((opt) => {
            const val = getValue(opt);
            const lbl = getLabel(opt);
            const OptionIcon = getIcon(opt);
            const isSelected = val === value;

            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-xs text-left font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 text-[#0f52ba] font-bold'
                    : 'text-[#0f172a] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  {OptionIcon && (
                    <OptionIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#0f52ba]' : 'text-slate-400'}`} />
                  )}
                  <span className="truncate">{lbl}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0f52ba] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
