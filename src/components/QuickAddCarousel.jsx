import React from 'react';
import {
  Tag, Flame, Lightbulb, Flag, Flower2, Heart, Music, Utensils, ShoppingBag, Droplets, Check,
  Car, Bus, Fuel, Sparkles, Zap, Image, Volume2, Mic, Coffee, Armchair, Building, ShieldCheck,
  Trash2, HandHeart, Home, Apple, Carrot, Box, Gift, Briefcase, Receipt, Coins, Ticket, Package,
  Wallet, CreditCard, Bookmark, Compass
} from 'lucide-react';

const FALLBACK_PALETTE = [
  { icon: Box, color: 'bg-[#edf4fc] text-[#0f52ba] border-[#bfdbfe]' },
  { icon: Carrot, color: 'bg-emerald-50 text-emerald-600 border-emerald-300' },
  { icon: Gift, color: 'bg-[#fdf4ff] text-[#c026d3] border-[#f5d0fe]' },
  { icon: Briefcase, color: 'bg-amber-50 text-amber-700 border-amber-300' },
  { icon: Receipt, color: 'bg-teal-50 text-teal-600 border-teal-300' },
  { icon: Coins, color: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
  { icon: Ticket, color: 'bg-indigo-50 text-indigo-600 border-indigo-300' },
  { icon: Package, color: 'bg-sky-50 text-sky-600 border-sky-300' },
  { icon: Wallet, color: 'bg-violet-50 text-violet-600 border-violet-300' },
  { icon: CreditCard, color: 'bg-blue-50 text-blue-600 border-blue-300' },
  { icon: Bookmark, color: 'bg-rose-50 text-rose-600 border-rose-300' },
  { icon: Compass, color: 'bg-orange-50 text-orange-600 border-orange-300' },
];

function getCategoryIconAndColor(catName) {
  const clean = String(catName || '').toLowerCase().trim();

  // 1. Direct Semantic Keyword Matching
  if (clean.includes('water') || clean.includes('cool') || clean.includes('drink')) {
    return { icon: Droplets, color: 'bg-cyan-50 text-cyan-600 border-cyan-300' };
  }
  if (clean.includes('veg') || clean.includes('vegetable') || clean.includes('grocery') || clean.includes('fruit')) {
    return { icon: Carrot, color: 'bg-emerald-50 text-emerald-600 border-emerald-300' };
  }
  if (clean.includes('flower') || clean.includes('decorat') || clean.includes('garland') || clean.includes('stage')) {
    return { icon: Flower2, color: 'bg-pink-50 text-pink-600 border-pink-300' };
  }
  if (clean.includes('pooja') || clean.includes('puja') || clean.includes('temple') || clean.includes('devotion')) {
    return { icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-300' };
  }
  if (clean.includes('cracker') || clean.includes('firework') || clean.includes('spark')) {
    return { icon: Flame, color: 'bg-amber-50 text-amber-600 border-amber-300' };
  }
  if (clean.includes('light') || clean.includes('electric') || clean.includes('generator') || clean.includes('current')) {
    return { icon: Lightbulb, color: 'bg-yellow-50 text-yellow-600 border-yellow-300' };
  }
  if (clean.includes('travel') || clean.includes('bus') || clean.includes('auto') || clean.includes('transport') || clean.includes('car') || clean.includes('cab')) {
    return { icon: Bus, color: 'bg-blue-50 text-blue-600 border-blue-300' };
  }
  if (clean.includes('fuel') || clean.includes('diesel') || clean.includes('petrol')) {
    return { icon: Fuel, color: 'bg-orange-50 text-orange-600 border-orange-300' };
  }
  if (clean.includes('banner') || clean.includes('flex') || clean.includes('poster') || clean.includes('board')) {
    return { icon: Flag, color: 'bg-purple-50 text-purple-600 border-purple-300' };
  }
  if (clean.includes('dj') || clean.includes('sound') || clean.includes('music') || clean.includes('speaker') || clean.includes('mic')) {
    return { icon: Music, color: 'bg-indigo-50 text-indigo-600 border-indigo-300' };
  }
  if (clean.includes('prasadam') || clean.includes('food') || clean.includes('cater') || clean.includes('meal') || clean.includes('lunch') || clean.includes('dinner')) {
    return { icon: Utensils, color: 'bg-emerald-50 text-emerald-600 border-emerald-300' };
  }
  if (clean.includes('tent') || clean.includes('shamiana') || clean.includes('chair') || clean.includes('table') || clean.includes('hall') || clean.includes('rent')) {
    return { icon: Home, color: 'bg-teal-50 text-teal-600 border-teal-300' };
  }
  if (clean.includes('security') || clean.includes('police') || clean.includes('guard')) {
    return { icon: ShieldCheck, color: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
  if (clean.includes('other')) {
    return { icon: ShoppingBag, color: 'bg-slate-100 text-slate-700 border-slate-300' };
  }

  // 2. Deterministic Hash Function for Non-Repetitive Fallback Icons
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_PALETTE.length;
  return FALLBACK_PALETTE[index];
}

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

      {/* Horizontally Scrollable Dynamic Non-Repetitive Category Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {activeCategoriesList.map((catName) => {
          const matched = getCategoryIconAndColor(catName);
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
