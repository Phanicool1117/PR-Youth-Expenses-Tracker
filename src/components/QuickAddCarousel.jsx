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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
          Select Category <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] font-medium text-slate-400">
          Swipe horizontally →
        </span>
      </div>

      {/* Horizontal Swipe Carousel with Prominent Selected State */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-1">
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
              className={`py-3 px-4 rounded-2xl border transition-all duration-200 flex items-center gap-2.5 shrink-0 snap-start text-left cursor-pointer select-none ${
                isSelected
                  ? 'bg-blue-50/95 border-[#0f52ba] shadow-md ring-2 ring-[#0f52ba]/25 text-[#0f52ba] scale-[1.04] z-10'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 text-[#0f172a] active:scale-95'
              }`}
            >
              {/* Category Icon */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform ${
                  isSelected ? 'scale-105 shadow-xs' : 'shadow-2xs'
                } ${color}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Category Title */}
              <span
                className={`text-xs sm:text-[13px] whitespace-nowrap ${
                  isSelected ? 'font-black text-[#0f52ba]' : 'font-bold text-[#0f172a]'
                }`}
              >
                {catName}
              </span>

              {/* Animated Selected Check Badge */}
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-[#0f52ba] text-white flex items-center justify-center shrink-0 shadow-2xs ml-0.5 animate-scale-up">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
