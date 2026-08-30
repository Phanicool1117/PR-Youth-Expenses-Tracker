import React from 'react';
import { getCategoryIconAndColor } from '../utils/categoryIcons';
import { triggerHaptic } from '../utils/hapticsSound';
import { Check } from 'lucide-react';

export function QuickAddCarousel({ selectedCategory, onSelectCategory, categories = [] }) {
  const defaultCategoriesList = [
    'Decoration Expenses',
    'Pooja Expenses',
    'Crackers Expenses',
    'Lights Expenses',
    'Travel Expenses',
    'Banner Expenses',
    'DJ Expenses',
    'Prasadam Expenses',
    'Water Expenses',
    'Vegatables Expenses',
    'Other Expenses',
  ];

  const activeCategoriesList = categories.length > 0 ? categories : defaultCategoriesList;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
          Select Category <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
          Scroll horizontally →
        </span>
      </div>

      {/* Ultra-Compact Horizontal Swipe Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-1 px-1">
        {activeCategoriesList.map((catName) => {
          const isSelected = selectedCategory === catName;
          const { icon: Icon, color } = getCategoryIconAndColor(catName);

          return (
            <button
              key={catName}
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onSelectCategory(catName);
              }}
              className={`py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-2xl border transition-all flex items-center gap-2 shrink-0 snap-start text-left cursor-pointer group select-none ${
                isSelected
                  ? 'bg-blue-50/90 border-[#0f52ba] shadow-sm ring-2 ring-[#0f52ba]/20 text-[#0f52ba]'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 text-[#0f172a] active:scale-95'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <span
                className={`text-xs font-bold whitespace-nowrap ${
                  isSelected ? 'text-[#0f52ba]' : 'text-[#0f172a]'
                }`}
              >
                {catName}
              </span>

              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-[#0f52ba] text-white flex items-center justify-center shrink-0 shadow-2xs ml-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
