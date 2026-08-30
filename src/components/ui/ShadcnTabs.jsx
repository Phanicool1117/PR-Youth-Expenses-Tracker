import React, { useState, useRef, useEffect } from 'react';
import { triggerHaptic } from '../../utils/hapticsSound';
import { ChevronDown, HeartHandshake, Flame } from 'lucide-react';

export function ShadcnTabs({ tabs = [], activeTab, donationSubTab = 'chanda', onSelectTab }) {
  const [hoveredTab, setHoveredTab] = useState(null);
  const [openDropdownTab, setOpenDropdownTab] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownTab(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="w-full bg-[#e2e8f0]/80 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-inner border border-slate-200/60 overflow-visible scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasSubTabs = Array.isArray(tab.subTabs) && tab.subTabs.length > 0;
          const isDropdownOpen = openDropdownTab === tab.id || (hoveredTab === tab.id && hasSubTabs);

          return (
            <div
              key={tab.id}
              className="relative flex-1"
              onMouseEnter={() => hasSubTabs && setHoveredTab(tab.id)}
              onMouseLeave={() => hasSubTabs && setHoveredTab(null)}
            >
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  if (hasSubTabs && !isActive) {
                    onSelectTab(tab.id, donationSubTab || 'chanda');
                  } else if (hasSubTabs && isActive) {
                    setOpenDropdownTab((prev) => (prev === tab.id ? null : tab.id));
                  } else {
                    onSelectTab(tab.id);
                  }
                }}
                className={`w-full py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all duration-300 ease-out flex items-center justify-center gap-1.5 select-none whitespace-nowrap active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0f52ba] shadow-md scale-[1.01] ring-1 ring-black/5 font-extrabold'
                    : 'text-slate-600 hover:text-[#0f172a] hover:bg-white/40'
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                      isActive ? 'text-[#0f52ba] scale-110' : 'text-slate-400'
                    }`}
                  />
                )}
                <span>{tab.label}</span>
                {hasSubTabs && (
                  <ChevronDown
                    className={`w-3 h-3 transition-transform text-slate-400 ${
                      isDropdownOpen ? 'rotate-180 text-[#0f52ba]' : ''
                    }`}
                  />
                )}
              </button>

              {/* Sub-Tabs Hover / Click Dropdown Menu */}
              {hasSubTabs && isDropdownOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl p-1.5 min-w-[160px] animate-in fade-in-50 zoom-in-95 duration-150"
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
                    Donation Portals
                  </div>
                  {tab.subTabs.map((sub) => {
                    const SubIcon = sub.icon || (sub.id === 'chanda' ? HeartHandshake : Flame);
                    const isSubActive = isActive && donationSubTab === sub.id;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic(12);
                          onSelectTab(tab.id, sub.id);
                          setOpenDropdownTab(null);
                          setHoveredTab(null);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs text-left font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSubActive
                            ? 'bg-blue-50 text-[#0f52ba] shadow-2xs'
                            : 'text-[#0f172a] hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            sub.id === 'laddu'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate">{sub.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
