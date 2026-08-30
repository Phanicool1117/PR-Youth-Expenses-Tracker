import React from 'react';
import { triggerHaptic } from '../../utils/hapticsSound';

export function ShadcnTabs({ tabs = [], activeTab, onSelectTab }) {
  return (
    <div className="w-full bg-[#e2e8f0]/80 p-1.5 rounded-2xl flex items-center gap-1.5 shadow-inner border border-slate-200/60 overflow-x-auto scrollbar-none scroll-smooth">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onSelectTab(tab.id);
            }}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 ease-out flex items-center justify-center gap-2 select-none whitespace-nowrap active:scale-95 cursor-pointer ${
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
          </button>
        );
      })}
    </div>
  );
}
