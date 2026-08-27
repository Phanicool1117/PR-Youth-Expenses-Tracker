import React from 'react';
import { Tag, Flame, Lightbulb, Flag, Flower2, Heart, Music, Utensils, ShoppingBag, Droplets, Check } from 'lucide-react';

const ICON_MAP = {
  'Decoration Expenses': { icon: Flower2, color: 'bg-pink-50 text-pink-600 border-pink-300' },
  'Pooja Expenses': { icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-300' },
  'Crackers Expenses': { icon: Flame, color: 'bg-amber-50 text-amber-600 border-amber-300' },
  'Lights Expenses': { icon: Lightbulb, color: 'bg-yellow-50 text-yellow-600 border-yellow-300' },
  'Travel Expenses': { icon: Tag, color: 'bg-blue-50 text-blue-600 border-blue-300' },
  'Banner Expenses': { icon: Flag, color: 'bg-purple-50 text-purple-600 border-purple-300' },
  'DJ Expenses': { icon: Music, color: 'bg-indigo-50 text-indigo-600 border-indigo-300' },
  'Prasadam Expenses': { icon: Utensils, color: 'bg-emerald-50 text-emerald-600 border-emerald-300' },
  'Water Expenses': { icon: Droplets, color: 'bg-cyan-50 text-cyan-600 border-cyan-300' },
  'Other Expenses': { icon: ShoppingBag, color: 'bg-slate-100 text-slate-700 border-slate-300' },
};

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
    'Other Expenses',
  ];

  const activeCategoriesList = categories.length > 0 ? categories : defaultCategoriesList;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
        Select Category <span className="text-rose-500">*</span>
      </label>

      {/* Horizontally Scrollable Dynamic Category Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {activeCategoriesList.map((catName) => {
          const matched = ICON_MAP[catName] || {
            icon: Tag,
            color: 'bg-blue-50 text-blue-600 border-blue-300',
          };
          const Icon = matched.icon;
          const isSelected = selectedCategory === catName;
          const labelText = catName.replace(/ Expenses$/i, '');

          return (
            <button
              key={catName}
              type="button"
              onClick={() => onSelectCategory(catName)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all shrink-0 w-24 h-24 space-y-1.5 relative ${
                isSelected
                  ? 'border-2 border-[#0f52ba] bg-[#0f52ba]/5 shadow-md scale-105'
                  : 'border-[#e5e5ea] bg-white hover:border-[#0f52ba]/40'
              }`}
            >
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0f52ba] text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}

              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${matched.color}`}>
                <Icon className="w-5 h-5" />
              </div>

              <span className="text-[10px] font-semibold text-[#1d1d1f] text-center leading-tight line-clamp-2">
                {labelText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
