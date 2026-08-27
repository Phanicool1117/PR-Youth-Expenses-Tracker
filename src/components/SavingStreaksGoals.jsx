import React from 'react';
import { Flame, PiggyBank, Gift, Trophy, CheckCircle2 } from 'lucide-react';

export function SavingStreaksGoals() {
  const goals = [
    {
      id: 1,
      title: 'Festival Fireworks Reserve',
      target: 15000,
      current: 12000,
      icon: Flame,
      color: 'from-amber-500 to-orange-400',
    },
    {
      id: 2,
      title: 'Prasadam & Mandapam Fund',
      target: 20000,
      current: 20000,
      icon: PiggyBank,
      color: 'from-emerald-500 to-teal-400',
      completed: true,
    },
    {
      id: 3,
      title: 'Sound & Light Equipment',
      target: 10000,
      current: 7500,
      icon: Gift,
      color: 'from-blue-500 to-indigo-400',
    },
  ];

  return (
    <div className="apple-card p-5 space-y-4">
      {/* Header with Saving Streak */}
      <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-[#1d1d1f]">Committee Budget Goals &amp; Streaks</h3>
        </div>

        {/* Saving Streak Badge (Matching Model Suggestion #3!) */}
        <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-full text-xs font-bold animate-pulse">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>7 Days Under Budget!</span>
        </div>
      </div>

      {/* Goal Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));

          return (
            <div
              key={goal.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                goal.completed
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : 'bg-white border-[#e5e5ea] hover:border-[#0071e3]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#1d1d1f]">
                  <Icon className="w-4 h-4 text-[#0071e3]" />
                </div>

                {goal.completed ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Achieved!
                  </span>
                ) : (
                  <span className="text-xs font-extrabold text-[#1d1d1f]">{pct}%</span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#1d1d1f] line-clamp-1">{goal.title}</h4>
                <p className="text-[11px] text-[#858585] mt-0.5">
                  ₹{goal.current.toLocaleString('en-IN')} / ₹{goal.target.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#f5f5f7] rounded-full overflow-hidden border border-[#e5e5ea]">
                <div
                  className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
