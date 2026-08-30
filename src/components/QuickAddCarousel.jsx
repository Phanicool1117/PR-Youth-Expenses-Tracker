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
      <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
        Select Category <span className="text-rose-500">*</span>
      </label>

      {/* Modern 2-Column Responsive Grid with Full-Width "Other" */}
      <div className="grid grid-cols-2 gap-2.5">
        {activeCategoriesList.map((catName) => {
          const isSelected = selectedCategory === catName;
          const { icon: Icon, color } = getCategoryIconAndColor(catName);
          const isOther = catName.toLowerCase().includes('other');

          return (
            <button
              key={catName}
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onSelectCategory(catName);
              }}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 text-left cursor-pointer group select-none ${
                isOther ? 'col-span-2' : 'col-span-1'
              } ${
                isSelected
                  ? 'bg-blue-50/90 border-[#0f52ba] shadow-sm ring-2 ring-[#0f52ba]/20'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-xs font-bold truncate leading-tight ${
                    isSelected ? 'text-[#0f52ba]' : 'text-[#0f172a]'
                  }`}
                >
                  {catName}
                </span>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-[#0f52ba] text-white flex items-center justify-center shrink-0 shadow-2xs animate-scale-up">
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
